const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Reclamation = sequelize.define(
  'Reclamation',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idUtilisateur: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    statut: { type: DataTypes.STRING, allowNull: false, defaultValue: 'en_attente' },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { tableName: 'reclamations', timestamps: true }
);

module.exports = Reclamation;
