function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/** Réponses plus claires pour erreurs SQL courantes (unicité, FK). */
function sendWriteError(res, error, fallbackMessage) {
  if (error?.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'Conflit : cette valeur existe déjà (contrainte unique)',
      detail: error.parent?.detail || error.message,
    });
  }
  if (error?.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      message: 'Référence invalide (clé étrangère)',
      detail: error.parent?.detail,
    });
  }
  return res.status(500).json({ message: fallbackMessage, error });
}

function crudController(Model, allowedFields = []) {
  return {
    list: async (req, res) => {
      try {
        const items = await Model.findAll();
        res.status(200).json(items);
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération', error });
      }
    },

    getById: async (req, res) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Introuvable' });
        res.status(200).json(item);
      } catch (error) {
        res.status(500).json({ message: 'Erreur', error });
      }
    },

    create: async (req, res) => {
      try {
        const data = allowedFields.length ? pick(req.body, allowedFields) : req.body;
        const item = await Model.create(data);
        res.status(201).json(item);
      } catch (error) {
        return sendWriteError(res, error, 'Erreur lors de la création');
      }
    },

    update: async (req, res) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Introuvable' });
        const data = allowedFields.length ? pick(req.body, allowedFields) : req.body;
        await item.update(data);
        res.status(200).json(item);
      } catch (error) {
        return sendWriteError(res, error, 'Erreur lors de la modification');
      }
    },

    remove: async (req, res) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Introuvable' });
        await item.destroy();
        res.status(200).json({ message: 'Supprimé' });
      } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression', error });
      }
    },
  };
}

module.exports = { crudController, sendWriteError };

