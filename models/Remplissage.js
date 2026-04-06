const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Remplissage = sequelize.define(
  'Remplissage',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idDispositif: { type: DataTypes.INTEGER, allowNull: false },
    idBac: { type: DataTypes.INTEGER, allowNull: false },
    distanceCm: { type: DataTypes.FLOAT, allowNull: false },
    batterie: { type: DataTypes.FLOAT, allowNull: true },
    niveauPourcent: { type: DataTypes.FLOAT, allowNull: false },
    dateMesure: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { tableName: 'remplissages', timestamps: true }
);

module.exports = Remplissage;

