const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Bac = sequelize.define(
  'Bac',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    localisation: { type: DataTypes.STRING, allowNull: false },
    capacite: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    tauxRemplissage: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    statut: { type: DataTypes.STRING, allowNull: false, defaultValue: 'actif' },
  },
  { tableName: 'bacs', timestamps: true }
);

module.exports = Bac;

