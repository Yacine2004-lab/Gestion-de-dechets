const { Utilisateur, Authentification, Role } = require('../models');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

// Afficher tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      attributes: { exclude: [] },
      include: [
        { model: Authentification, attributes: ['login'], required: false },
        { model: Role, attributes: ['id', 'nom'], required: false },
      ],
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', error });
  }
};

// Afficher plusieurs utilisateurs (query: ?ids=1,2,3)
exports.getUsers = async (req, res) => {
  try {
    const ids = req.query.ids;
    if (!ids) {
      return res.status(400).json({ message: 'Paramètre ids requis (ex: ?ids=1,2,3)' });
    }
    const idList = ids.split(',').map((id) => parseInt(id.trim(), 10)).filter(Boolean);
    const users = await Utilisateur.findAll({
      where: { id: idList },
      include: [
        { model: Authentification, attributes: ['login'], required: false },
        { model: Role, attributes: ['id', 'nom'], required: false },
      ],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error });
  }
};

// Afficher un utilisateur par id
exports.getUserById = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id, {
      include: [
        { model: Authentification, attributes: ['login'], required: false },
        { model: Role, attributes: ['id', 'nom'], required: false },
      ],
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error });
  }
};

// Créer un nouvel utilisateur (inscription)
exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role, telephone, localisation } = req.body;

    if (!nom || !email || !motDePasse) {
      return res
        .status(400)
        .json({ message: 'nom, email et motDePasse sont obligatoires' });
    }

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const roleNom = String(role || 'citoyen').toLowerCase();
    const roleRow = await Role.findOne({ where: { nom: roleNom } });

    const user = await Utilisateur.create({
      nom,
      prenom: prenom || null,
      email,
      role: roleNom,
      idRole: roleRow ? roleRow.id : null,
      telephone: telephone || null,
      localisation: localisation || null,
      etat: true,
    });

    const hashedPassword = await bcrypt.hash(motDePasse, BCRYPT_ROUNDS);

    await Authentification.create({
      idUtilisateur: user.id,
      login: email,
      mdPasse: hashedPassword,
    });

    res.status(201).json(user.get({ plain: true }));
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création', error });
  }
};

// Modifier un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const { nom, prenom, email, telephone, role, idRole, localisation, etat } = req.body;
    const updates = {
      ...(nom !== undefined && { nom }),
      ...(prenom !== undefined && { prenom }),
      ...(email !== undefined && { email }),
      ...(telephone !== undefined && { telephone }),
      ...(role !== undefined && { role: String(role).toLowerCase() }),
      ...(idRole !== undefined && { idRole }),
      ...(localisation !== undefined && { localisation }),
      ...(etat !== undefined && { etat }),
    };
    if (role !== undefined && idRole === undefined) {
      const roleRow = await Role.findOne({ where: { nom: updates.role } });
      if (roleRow) updates.idRole = roleRow.id;
    }
    await user.update(updates);

    res.status(200).json(user.get({ plain: true }));
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification', error });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    await Authentification.destroy({ where: { idUtilisateur: user.id } });
    await user.destroy();
    res.status(200).json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error });
  }
};
