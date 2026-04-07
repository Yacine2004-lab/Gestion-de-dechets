const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Localisation = sequelize.define(
  'Localisation',
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    adresse: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // ✅ ENUM pour sécuriser les quartiers de Dakar
    quartier: { 
      type: DataTypes.ENUM(
        'Dakar Plateau', 'Médina', 'Fann-Point E', 'Ouakam', 'Ngor', 
        'Yoff', 'Grand Yoff', 'Parcelles Assainies', 'Pikine', 'Guédiawaye', 
        'Rufisque', 'Thiaroye', 'Sangalkam', 'Hann Bel-Air'
      ), 
      allowNull: false 
    },
    // ✅ ENUM pour les départements de la région
    departement: { 
      type: DataTypes.ENUM('Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'), 
      allowNull: false 
    },
    latitude: { 
      type: DataTypes.FLOAT, 
      allowNull: false 
    },
    longitude: { 
      type: DataTypes.FLOAT, 
      allowNull: false 
    },
    itineraire: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    // Relation vers ZoneRisque
    idZoneRisque: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      references: {
        model: 'zones_risque',
        key: 'id'
      }
    },
  },
  {
    tableName: 'localisations',
    timestamps: true,
    underscored: true, // Utilise created_at et updated_at en base
  }
);

module.exports = Localisation;