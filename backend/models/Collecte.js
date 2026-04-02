const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Collecte = sequelize.define(
  'Collecte',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idUtilisateur: { type: DataTypes.INTEGER, allowNull: false },
    idBac: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    quantiteCollecte: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'collectes', timestamps: true }
);

module.exports = Collecte;

