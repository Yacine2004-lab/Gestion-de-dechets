const { Signalement } = require('../models');

function pickDefined(obj, keys) {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

module.exports = {
  list: async (req, res) => {
    try {
      const items = await Signalement.findAll();
      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ message: 'Erreur lors de la récupération', error });
    }
  },

  getById: async (req, res) => {
    try {
      const item = await Signalement.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: 'Introuvable' });
      return res.status(200).json(item);
    } catch (error) {
      return res.status(500).json({ message: 'Erreur', error });
    }
  },

  // Citoyen : crée un signalement en son nom (idUtilisateur = token)
  create: async (req, res) => {
    try {
      const idUtilisateur = Number(req.auth?.idUtilisateur);
      if (!idUtilisateur) return res.status(401).json({ message: 'Token invalide' });

      const { idBac, idAlerte, type, description, statut, date } = req.body;
      if (!description) {
        return res.status(400).json({ message: 'description est obligatoire' });
      }

      const item = await Signalement.create({
        idUtilisateur,
        ...pickDefined(
          {
            idBac: idBac !== undefined ? Number(idBac) : undefined,
            idAlerte: idAlerte !== undefined ? Number(idAlerte) : undefined,
            type,
            description,
            statut,
            date,
          },
          ['idBac', 'idAlerte', 'type', 'description', 'statut', 'date']
        ),
      });

      return res.status(201).json(item);
    } catch (error) {
      return res.status(500).json({ message: 'Erreur lors de la création', error });
    }
  },

  // Citoyen : modifie uniquement ses propres signalements
  update: async (req, res) => {
    try {
      const idUtilisateur = Number(req.auth?.idUtilisateur);
      if (!idUtilisateur) return res.status(401).json({ message: 'Token invalide' });

      const item = await Signalement.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: 'Introuvable' });

      if (Number(item.idUtilisateur) !== idUtilisateur) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      // On n'autorise pas de changer idUtilisateur via API
      const patch = pickDefined(req.body, ['idBac', 'idAlerte', 'type', 'description', 'statut', 'date']);
      if (patch.idBac !== undefined) patch.idBac = patch.idBac === null ? null : Number(patch.idBac);
      if (patch.idAlerte !== undefined)
        patch.idAlerte = patch.idAlerte === null ? null : Number(patch.idAlerte);

      await item.update(patch);
      return res.status(200).json(item);
    } catch (error) {
      return res.status(500).json({ message: 'Erreur lors de la modification', error });
    }
  },

  // Citoyen : supprime uniquement ses propres signalements
  remove: async (req, res) => {
    try {
      const idUtilisateur = Number(req.auth?.idUtilisateur);
      if (!idUtilisateur) return res.status(401).json({ message: 'Token invalide' });

      const item = await Signalement.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: 'Introuvable' });

      if (Number(item.idUtilisateur) !== idUtilisateur) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      await item.destroy();
      return res.status(200).json({ message: 'Supprimé' });
    } catch (error) {
      return res.status(500).json({ message: 'Erreur lors de la suppression', error });
    }
  },
};

