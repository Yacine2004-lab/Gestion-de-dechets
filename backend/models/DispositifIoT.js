const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DispositifIoT = sequelize.define(
  'DispositifIoT',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idSerie: { type: DataTypes.STRING, allowNull: false, unique: true },
    typeCapteur: { type: DataTypes.STRING, allowNull: false },
    niveauMesure: { type: DataTypes.STRING, allowNull: true },
    batterie: { type: DataTypes.FLOAT, allowNull: true },
    etat: { type: DataTypes.STRING, allowNull: false, defaultValue: 'actif' },
    idBac: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: 'dispositifs_iot', timestamps: true }
);

module.exports = DispositifIoT;

