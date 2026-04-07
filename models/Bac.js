const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Bac = sequelize.define(
  'Bac',
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    // ✅ Liste complète basée sur tes données réelles (image pgAdmin)
    localisation: { 
      type: DataTypes.ENUM(
        // Communes officielles
        'Dakar Plateau', 'Médina', 'Fann-Point E', 'Ouakam', 'Ngor', 
        'Yoff', 'Grand Yoff', 'Parcelles Assainies', 'Pikine', 'Guédiawaye',
        
        // Tes données de test actuelles (exactement comme dans ta DB)
        'Dakar',
        'Rue 10, Dakar',
        'Rue 12, Dakar',
        'Rue 15, Dakar',
        'parcelle, Dakar',
        'fadia, Dakar',
        'sacre coeur, Dakar',
        'Nord foire',
        'pikine',
        'thiaroye'
      ), 
      allowNull: false 
    },
    capacite: { 
      type: DataTypes.FLOAT, 
      allowNull: false, 
      defaultValue: 100 
    },
    tauxRemplissage: { 
      type: DataTypes.FLOAT, 
      allowNull: false, 
      defaultValue: 0 
    },
    statut: { 
      type: DataTypes.ENUM('actif', 'maintenance', 'hors-service'), 
      allowNull: false, 
      defaultValue: 'actif' 
    },
  },
  { 
    tableName: 'bacs', 
    timestamps: true 
  }
);

module.exports = Bac;