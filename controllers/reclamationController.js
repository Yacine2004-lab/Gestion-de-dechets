const { Reclamation } = require('../models');

exports.list = async (req, res) => {
  try {
    const items = await Reclamation.findAll();
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', error });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Reclamation.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Introuvable' });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur', error });
  }
};

exports.create = async (req, res) => {
  try {
    const idUtilisateur = Number(req.auth?.idUtilisateur);
    if (!idUtilisateur) return res.status(401).json({ message: 'Token invalide' });

    const item = await Reclamation.create({
      idUtilisateur,
      description: req.body.description,
      statut: req.body.statut || 'en_attente',
      date: req.body.date || new Date(),
    });
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la création', error });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Reclamation.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Introuvable' });
    await item.update({
      ...(req.body.description !== undefined && { description: req.body.description }),
      ...(req.body.statut !== undefined && { statut: req.body.statut }),
      ...(req.body.date !== undefined && { date: req.body.date }),
    });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la modification', error });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Reclamation.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Introuvable' });
    await item.destroy();
    return res.status(200).json({ message: 'Supprimé' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la suppression', error });
  }
};
