const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Alerte = sequelize.define(
  'Alerte',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idBac: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: false },
    niveauUrgence: { type: DataTypes.STRING, allowNull: false, defaultValue: 'moyen' },
    statut: { type: DataTypes.STRING, allowNull: false, defaultValue: 'OUVERTE' },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    message: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: 'alertes', timestamps: true }
);

module.exports = Alerte;

