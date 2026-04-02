const { Localisation } = require('../models');
const { crudController } = require('./crudFactory');

module.exports = crudController(Localisation, [
  'adresse',
  'latitude',
  'longitude',
  'idDepartement',
  'idItineraire',
  'idZoneRisque',
]);
