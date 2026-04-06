// Permission (gestion des rôles et permissions - scope prof)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Permission = sequelize.define(
  'Permission',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING },
  },
  { tableName: 'permissions', timestamps: false }
);

module.exports = Permission;
