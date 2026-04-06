const { Camion } = require('../models');
const { crudController } = require('./crudFactory');

module.exports = crudController(Camion, ['immatriculation', 'etat', 'capacite', 'idItineraire']);
