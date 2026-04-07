const { Alerte } = require('../models');
const { crudController } = require('./crudFactory');
const { Op } = require('sequelize');

const factory = crudController(Alerte, ['type', 'niveauUrgence', 'statut', 'date', 'message', 'idBac']);

// --- PERSONNALISATION DE LA LECTURE ---
factory.list = async (req, res) => {
  try {
    // La magie est ici : on ne prend que ce qui n'est PAS 'RESOLUE'
    const data = await Alerte.findAll({
      where: {
        statut: {
          [Op.not]: 'RESOLUE' 
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// On garde 'history' pour que l'Admin puisse quand même voir les preuves en cas de besoin
factory.history = async (req, res) => {
  try {
    const data = await Alerte.findAll({ order: [['createdAt', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = factory;