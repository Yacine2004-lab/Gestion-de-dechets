const { Bac } = require('../models');
const { crudController } = require('./crudFactory');

module.exports = crudController(Bac, [
  'localisation',
  'capacite',
  'tauxRemplissage',
  'statut',
]);

