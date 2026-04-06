const { ZoneRisque } = require('../models');
const { crudController } = require('./crudFactory');

module.exports = crudController(ZoneRisque, ['niveauRisque', 'cause']);
