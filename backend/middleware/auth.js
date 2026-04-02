const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token manquant (Bearer)' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET manquant dans .env' });
    }
    req.auth = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

async function adminOnly(req, res, next) {
  try {
    const id = req.auth?.idUtilisateur;
    if (!id) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    // Vérifie le rôle actuel en base (pas seulement celui du token)
    const user = await Utilisateur.findByPk(id, { attributes: ['id', 'role'] });
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    const role = (user.role || '').toLowerCase();
    if (role !== 'admin') {
      return res
        .status(403)
        .json({ message: "Accès refusé : seul l'administrateur doit faire ça" });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Erreur de vérification des droits', error });
  }
}

function roleAllowed(roles) {
  const allow = (roles || []).map((r) => String(r).toLowerCase());
  return async function roleAllowedMiddleware(req, res, next) {
    try {
      const id = req.auth?.idUtilisateur;
      if (!id) return res.status(401).json({ message: 'Token invalide' });

      const user = await Utilisateur.findByPk(id, { attributes: ['id', 'role'] });
      if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });

      const role = (user.role || '').toLowerCase();
      if (!allow.includes(role)) {
        return res
          .status(403)
          .json({ message: "Accès refusé : rôle non autorisé" });
      }
      return next();
    } catch (error) {
      return res.status(500).json({ message: 'Erreur de vérification des droits', error });
    }
  };
}

module.exports = { authRequired, adminOnly, roleAllowed };

