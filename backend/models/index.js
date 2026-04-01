// Modèles pour le scope prof : utilisateurs + authentification + rôles/permissions
const { sequelize } = require('../config/db');

const Utilisateur = require('./Utilisateur');
const Authentification = require('./Authentification');
const Role = require('./Role');
const Permission = require('./Permission');
const RefreshToken = require('./RefreshToken');
const Bac = require('./Bac');
const DispositifIoT = require('./DispositifIoT');
const Remplissage = require('./Remplissage');
const Collecte = require('./Collecte');
const Alerte = require('./Alerte');
const Signalement = require('./Signalement');

// Utilisateur <-> Authentification (1-1)
Utilisateur.hasOne(Authentification, { foreignKey: 'idUtilisateur' });
Authentification.belongsTo(Utilisateur, { foreignKey: 'idUtilisateur' });

// Utilisateur -> Role (n-1)
Utilisateur.belongsTo(Role, { foreignKey: 'idRole' });
Role.hasMany(Utilisateur, { foreignKey: 'idRole' });

// Role <-> Permission (n-n via role_permissions)
Role.belongsToMany(Permission, {
  through: 'role_permissions',
  foreignKey: 'idRole',
  otherKey: 'idPermission',
});
Permission.belongsToMany(Role, {
  through: 'role_permissions',
  foreignKey: 'idPermission',
  otherKey: 'idRole',
});

// Utilisateur -> RefreshToken (1-n)
Utilisateur.hasMany(RefreshToken, { foreignKey: 'idUtilisateur' });
RefreshToken.belongsTo(Utilisateur, { foreignKey: 'idUtilisateur' });

// Bac -> DispositifIoT (1-n)
Bac.hasMany(DispositifIoT, { foreignKey: 'idBac' });
DispositifIoT.belongsTo(Bac, { foreignKey: 'idBac' });

// DispositifIoT -> Remplissage (1-n)
DispositifIoT.hasMany(Remplissage, { foreignKey: 'idDispositif' });
Remplissage.belongsTo(DispositifIoT, { foreignKey: 'idDispositif' });

// Bac -> Remplissage (1-n)
Bac.hasMany(Remplissage, { foreignKey: 'idBac' });
Remplissage.belongsTo(Bac, { foreignKey: 'idBac' });

// Utilisateur -> Collecte (1-n)
Utilisateur.hasMany(Collecte, { foreignKey: 'idUtilisateur' });
Collecte.belongsTo(Utilisateur, { foreignKey: 'idUtilisateur' });

// Bac -> Collecte (1-n)
Bac.hasMany(Collecte, { foreignKey: 'idBac' });
Collecte.belongsTo(Bac, { foreignKey: 'idBac' });

// Utilisateur -> Signalement (1-n)
Utilisateur.hasMany(Signalement, { foreignKey: 'idUtilisateur' });
Signalement.belongsTo(Utilisateur, { foreignKey: 'idUtilisateur' });

// Bac -> Signalement (1-n, optionnel)
Bac.hasMany(Signalement, { foreignKey: 'idBac' });
Signalement.belongsTo(Bac, { foreignKey: 'idBac' });

// Bac -> Alerte (1-n)
Bac.hasMany(Alerte, { foreignKey: 'idBac' });
Alerte.belongsTo(Bac, { foreignKey: 'idBac' });

// Alerte -> Signalement (1-n, optionnel)
Alerte.hasMany(Signalement, { foreignKey: 'idAlerte' });
Signalement.belongsTo(Alerte, { foreignKey: 'idAlerte' });

module.exports = {
  sequelize,
  Utilisateur,
  Authentification,
  Role,
  Permission,
  RefreshToken,
  Bac,
  DispositifIoT,
  Remplissage,
  Collecte,
  Alerte,
  Signalement,
};
