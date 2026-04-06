// Utilisateur (diagramme de classe)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Utilisateur = sequelize.define(
  'Utilisateur',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    prenom: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: false },
    etat: { type: DataTypes.BOOLEAN, defaultValue: true },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'citoyen' },
    localisation: { type: DataTypes.STRING },
    idRole: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: 'utilisateurs', timestamps: false }
);

module.exports = Utilisateur;
