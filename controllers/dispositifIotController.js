const { DispositifIoT } = require('../models');
const { crudController } = require('./crudFactory');

const base = crudController(DispositifIoT, [
  'typeCapteur',
  'niveauMesure',
  'batterie',
  'etat',
  'idBac',
]);

module.exports = {
  ...base,
  create: async (req, res) => {
    try {
      const data = {
        idSerie: null,
        typeCapteur: req.body.typeCapteur,
        niveauMesure: req.body.niveauMesure,
        batterie: req.body.batterie,
        etat: req.body.etat,
        idBac: req.body.idBac,
      };

      const item = await DispositifIoT.create(data);
      const auto = `IOT-${String(item.id).padStart(5, '0')}`;
      await item.update({ idSerie: auto });

      return res.status(201).json(item);
    } catch (error) {
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
      return res.status(500).json({ message: 'Erreur lors de la création', error });
    }
  },
};

