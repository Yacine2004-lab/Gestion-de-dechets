const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Localisation = sequelize.define(
  'Localisation',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    adresse: { type: DataTypes.STRING, allowNull: false },
    quartier: { type: DataTypes.STRING, allowNull: true },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    departement: { type: DataTypes.STRING, allowNull: true },
    itineraire: { type: DataTypes.STRING, allowNull: true },
    idZoneRisque: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: 'localisations',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Localisation;
