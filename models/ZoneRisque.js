const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ZoneRisque = sequelize.define(
  'ZoneRisque',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    niveauRisque: { type: DataTypes.STRING, allowNull: false, defaultValue: 'moyen' },
    cause: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'zones_risque', timestamps: true }
);

module.exports = ZoneRisque;
