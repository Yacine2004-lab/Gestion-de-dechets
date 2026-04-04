const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/** Types de capteur IoT (enum SQL + validation API). */
const TYPE_CAPTEURS = ['ultrason', 'ESP-32'];

const DispositifIoT = sequelize.define(
  'DispositifIoT',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    /** Numéro de série auto-attribué à la création (IOT-00001, …), non modifiable via API. */
    idSerie: { type: DataTypes.STRING, allowNull: true, unique: true },
    typeCapteur: { type: DataTypes.ENUM(...TYPE_CAPTEURS), allowNull: false },
    niveauMesure: { type: DataTypes.STRING, allowNull: true },
    batterie: { type: DataTypes.FLOAT, allowNull: true },
    etat: { type: DataTypes.STRING, allowNull: false, defaultValue: 'actif' },
    idBac: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: 'dispositifs_iot', timestamps: true }
);

DispositifIoT.TYPE_CAPTEURS = TYPE_CAPTEURS;
module.exports = DispositifIoT;

