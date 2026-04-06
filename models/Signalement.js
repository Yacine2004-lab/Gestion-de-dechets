const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Signalement = sequelize.define(
  'Signalement',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idUtilisateur: { type: DataTypes.INTEGER, allowNull: false },
    idBac: { type: DataTypes.INTEGER, allowNull: true },
    idAlerte: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'anomalie' },
    description: { type: DataTypes.TEXT, allowNull: false },
    statut: { type: DataTypes.STRING, allowNull: false, defaultValue: 'ouvert' },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { tableName: 'signalements', timestamps: true }
);

module.exports = Signalement;

