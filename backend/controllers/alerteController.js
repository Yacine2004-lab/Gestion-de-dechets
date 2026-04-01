const { Alerte } = require('../models');
const { crudController } = require('./crudFactory');
module.exports = crudController(Alerte, ['type', 'niveauUrgence', 'statut', 'date', 'message', 'idBac']);

