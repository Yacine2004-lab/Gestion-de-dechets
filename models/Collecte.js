const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Collecte = sequelize.define(
  'Collecte',
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    idUtilisateur: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    idBac: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    date: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW 
    },
    // ✅ AJOUT : Pour savoir si la collecte est finie ou pas
    statut: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'en attente' // Valeurs possibles: 'en attente', 'terminée'
    },
    // ✅ AJOUT : Pour enregistrer l'heure précise où le bac a été vidé
    dateFin: { 
      type: DataTypes.DATE, 
      allowNull: true 
    }
  },
  { 
    tableName: 'collectes', 
    timestamps: true 
  }
);

module.exports = Collecte;