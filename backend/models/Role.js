// Role (gestion des rôles et permissions - scope prof)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Role = sequelize.define(
  'Role',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { tableName: 'roles', timestamps: false }
);

module.exports = Role;
