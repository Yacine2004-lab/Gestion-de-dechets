const { Collecte, Bac, Utilisateur } = require('../models');

exports.list = async (req, res) => {
  try {
    const items = await Collecte.findAll();
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', error });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Collecte.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Introuvable' });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error });
  }
};

// IMPORTANT (rôle lu en base, comme roleAllowed) :
// - collecteur : idUtilisateur = utilisateur connecté
// - admin : peut passer idUtilisateur dans le body (collecteur concerné), sinon = admin lui-même
exports.create = async (req, res) => {
  try {
    const idFromToken = req.auth?.idUtilisateur;
    const actor = await Utilisateur.findByPk(idFromToken, { attributes: ['id', 'role'] });
    if (!actor) return res.status(401).json({ message: 'Utilisateur introuvable' });
    const roleDb = String(actor.role || '').toLowerCase();

    const idBac = Number(req.body.idBac);
    const quantiteCollecte = Number(req.body.quantiteCollecte ?? 0);
    const date = req.body.date;

    if (!idBac) return res.status(400).json({ message: 'idBac est obligatoire' });

    const bac = await Bac.findByPk(idBac);
    if (!bac) return res.status(400).json({ message: 'Bac introuvable (idBac)' });

    let idUtilisateur = null;
    if (roleDb === 'admin') {
      idUtilisateur = req.body.idUtilisateur ? Number(req.body.idUtilisateur) : Number(idFromToken);
    } else {
      idUtilisateur = Number(idFromToken);
    }

    if (!idUtilisateur) {
      return res.status(400).json({ message: 'idUtilisateur introuvable (token)' });
    }

    const user = await Utilisateur.findByPk(idUtilisateur);
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur introuvable (idUtilisateur)' });
    }

    const item = await Collecte.create({
      idUtilisateur,
      idBac,
      date: date || new Date(),
      quantiteCollecte,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création', error });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Collecte.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Introuvable' });

    const idFromToken = Number(req.auth?.idUtilisateur);
    const actor = await Utilisateur.findByPk(idFromToken, { attributes: ['role'] });
    const roleDb = String(actor?.role || '').toLowerCase();

    // collecteur : uniquement ses collectes ; admin : toutes
    if (roleDb !== 'admin' && item.idUtilisateur !== idFromToken) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const patch = {};
    if (req.body.idBac !== undefined) patch.idBac = Number(req.body.idBac);
    if (req.body.quantiteCollecte !== undefined) patch.quantiteCollecte = Number(req.body.quantiteCollecte);
    if (req.body.date !== undefined) patch.date = req.body.date;

    await item.update(patch);
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification', error });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Collecte.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Introuvable' });
    await item.destroy();
    res.status(200).json({ message: 'Supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error });
  }
};

