const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Camion = sequelize.define(
  'Camion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    immatriculation: { type: DataTypes.STRING, allowNull: false, unique: true },
    etat: { type: DataTypes.STRING, allowNull: false, defaultValue: 'actif' },
    capacite: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    idItineraire: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: 'camions', timestamps: true }
);

module.exports = Camion;
