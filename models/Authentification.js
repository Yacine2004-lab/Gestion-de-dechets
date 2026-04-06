// Authentification (1-1 Utilisateur)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Authentification = sequelize.define(
  'Authentification',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idUtilisateur: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    login: { type: DataTypes.STRING, allowNull: false },
    mdPasse: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: 'authentifications', timestamps: false }
);

module.exports = Authentification;
