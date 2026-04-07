// backend/server.js - Point d'entrée API
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { connectDB, sequelize } = require('./config/db');
const { Utilisateur, Authentification, Role } = require('./models');

// Import des routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const bacRoutes = require('./routes/bacRoutes');
const dispositifIotRoutes = require('./routes/dispositifIotRoutes');
const collecteRoutes = require('./routes/collecteRoutes');
const alerteRoutes = require('./routes/alerteRoutes');
const signalementRoutes = require('./routes/signalementRoutes');
const iotRoutes = require('./routes/iotRoutes');
const camionRoutes = require('./routes/camionRoutes');
const reclamationRoutes = require('./routes/reclamationRoutes');
const zoneRisqueRoutes = require('./routes/zoneRisqueRoutes');
const localisationRoutes = require('./routes/localisationRoutes');
const remplissageRoutes = require('./routes/remplissageRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const PORT = process.env.PORT || 5002;

// --- DOCUMENTATION API ---
app.get('/', (req, res) => {
  res.json({
    message: "Système de Gestion des Déchets Urbains - Dakar (API)",
    version: "1.2.0",
    status: "Opérationnel",
    principaux_endpoints: {
      'POST /api/auth/login': 'Connexion (JWT)',
      'POST /api/iot/update': 'Simulation capteur ESP32',
      'GET /api/bacs': 'État des bacs à Dakar'
    }
  });
});

// --- ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bacs', bacRoutes);
app.use('/api/dispositifs-iot', dispositifIotRoutes);
app.use('/api/collectes', collecteRoutes);
app.use('/api/alertes', alerteRoutes);
app.use('/api/signalements', signalementRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/camions', camionRoutes);
app.use('/api/reclamations', reclamationRoutes);
app.use('/api/zones-risque', zoneRisqueRoutes);
app.use('/api/localisations', localisationRoutes);
app.use('/api/remplissages', remplissageRoutes);

// --- INITIALISATION ADMIN ---
async function bootstrapAdmin() {
  const [adminRole] = await Role.findOrCreate({ where: { nom: 'admin' } });
  await Role.findOrCreate({ where: { nom: 'citoyen' } });
  await Role.findOrCreate({ where: { nom: 'collecteur' } });

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@test.com';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

  const [adminUser, created] = await Utilisateur.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      nom: 'Admin',
      prenom: 'System',
      email: adminEmail,
      etat: true,
      role: 'admin',
      idRole: adminRole.id,
      localisation: 'Dakar Plateau'
    },
  });

  const existingAuth = await Authentification.findOne({ where: { idUtilisateur: adminUser.id } });
  if (!existingAuth) {
    const hashed = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
    await Authentification.create({ idUtilisateur: adminUser.id, login: adminEmail, mdPasse: hashed });
  }

  if (created) console.log(`✅ Compte admin vérifié/créé: ${adminEmail}`);
}

// --- DÉMARRAGE DU SERVEUR ---
async function start() {
  try {
    await connectDB();
    
    // ✅ UTILISATION DE ALTER: TRUE (Ne supprime pas les données)
    // Synchronise les modèles avec la base en essayant de modifier les colonnes existantes
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée avec succès (Mode: ALTER)');
    
    await bootstrapAdmin();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Démarrage impossible :', err.message);
    // Petit conseil : si ça plante ici, c'est souvent parce que SQL refuse de changer 
    // une colonne STRING en ENUM si des données ne correspondent pas.
    process.exit(1);
  }
}

start();