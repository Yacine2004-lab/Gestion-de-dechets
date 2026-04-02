const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const TYPE_CAPTEURS = ['ultrason', 'ESP32', 'autres'];

const DispositifIoT = sequelize.define(
  'DispositifIoT',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idSerie: { type: DataTypes.STRING, allowNull: true, unique: true },
    typeCapteur: { type: DataTypes.ENUM(...TYPE_CAPTEURS), allowNull: false },
    niveauMesure: { type: DataTypes.STRING, allowNull: true },
    batterie: { type: DataTypes.FLOAT, allowNull: true },
    etat: { type: DataTypes.STRING, allowNull: false, defaultValue: 'actif' },
    idBac: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: 'dispositifs_iot', timestamps: true }
);

module.exports = DispositifIoT;

