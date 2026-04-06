const { Utilisateur, Authentification, Role, RefreshToken } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

async function verifyPasswordAndMigrate(authRow, plainPassword) {
  const stored = String(authRow?.mdPasse || '');
  if (!stored) return false;

  // Cas normal: mot de passe déjà hashé bcrypt
  if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
    return bcrypt.compare(plainPassword, stored);
  }

  // Compatibilité legacy: ancien mot de passe en clair, puis migration vers bcrypt
  if (stored === plainPassword) {
    const hashed = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
    await authRow.update({ mdPasse: hashed });
    return true;
  }

  return false;
}

function signAccessToken(user, secret) {
  return jwt.sign(
    {
      idUtilisateur: user.id,
      email: user.email,
      role: user.role,
      idRole: user.idRole || null,
    },
    secret,
    { expiresIn: '15m' }
  );
}

function signRefreshToken(user, secret) {
  return jwt.sign({ idUtilisateur: user.id }, secret, { expiresIn: '7d' });
}

// Connexion (vérifier login + mdPasse)
exports.login = async (req, res) => {
  try {
    const { login, mdPasse } = req.body;
    if (!login || !mdPasse) {
      return res.status(400).json({ message: 'login et mdPasse sont obligatoires' });
    }

    const auth = await Authentification.findOne({
      where: { login },
      include: [{ model: Utilisateur, include: [{ model: Role, attributes: ['id', 'nom'] }] }],
    });
    if (!auth) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    const ok = await verifyPasswordAndMigrate(auth, mdPasse);
    if (!ok) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    if (!auth.Utilisateur) {
      return res.status(500).json({ message: 'Compte incomplet : utilisateur lié introuvable' });
    }

    const user = auth.Utilisateur.get({ plain: true });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET manquant dans .env' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || secret;
    const accessToken = signAccessToken(user, secret);
    const refreshToken = signRefreshToken(user, refreshSecret);

    await RefreshToken.create({
      idUtilisateur: user.id,
      token: refreshToken,
      revoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      message: 'Connexion réussie',
      token: accessToken,
      refreshToken,
      utilisateur: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error });
  }
};

// Vérifier le token et retourner l'utilisateur
exports.me = async (req, res) => {
  try {
    const id = req.auth?.idUtilisateur;
    if (!id) return res.status(401).json({ message: 'Token invalide' });
    const user = await Utilisateur.findByPk(id, {
      include: [{ model: Role, attributes: ['id', 'nom'], required: false }],
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error });
  }
};

// Renouveler l'access token depuis refresh token
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken requis' });
    }

    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET || secret;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET manquant dans .env' });
    }

    const stored = await RefreshToken.findOne({ where: { token: refreshToken, revoked: false } });
    if (!stored) return res.status(401).json({ message: 'Refresh token invalide' });
    if (stored.expiresAt < new Date()) {
      await stored.update({ revoked: true });
      return res.status(401).json({ message: 'Refresh token expiré' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, refreshSecret);
    } catch {
      return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
    }

    const user = await Utilisateur.findByPk(payload.idUtilisateur);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const newAccessToken = signAccessToken(user.get({ plain: true }), secret);
    return res.status(200).json({ token: newAccessToken });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du refresh', error });
  }
};

// Déconnexion: révoque le refresh token envoyé
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    // 1) Si le client fournit un refreshToken -> on le révoque
    if (refreshToken) {
      await RefreshToken.update(
        { revoked: true },
        { where: { token: refreshToken } }
      );
      return res.status(200).json({ message: 'Déconnexion réussie' });
    }

    // 2) Sinon, si le client fournit un access token Bearer -> on révoque tous les refresh tokens de l'utilisateur
    const header = req.headers.authorization || '';
    const [type, accessToken] = header.split(' ');
    if (type === 'Bearer' && accessToken) {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'JWT_SECRET manquant dans .env' });
      }
      const payload = jwt.verify(accessToken, secret);
      await RefreshToken.update(
        { revoked: true },
        { where: { idUtilisateur: payload.idUtilisateur } }
      );
      return res.status(200).json({ message: 'Déconnexion réussie' });
    }

    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
    res.status(500).json({ message: 'Erreur lors de la déconnexion', error });
  }
};
