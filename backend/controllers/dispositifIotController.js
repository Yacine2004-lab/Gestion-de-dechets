const { DispositifIoT } = require('../models');
const { crudController } = require('./crudFactory');

module.exports = crudController(DispositifIoT, [
  'idSerie',
  'typeCapteur',
  'niveauMesure',
  'batterie',
  'etat',
  'idBac',
]);

