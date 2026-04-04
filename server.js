// backend/server.js - Point d'entrée API
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { connectDB, sequelize } = require('./config/db');
const { Utilisateur, Authentification, Role } = require('./models'); // modèles + associations
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

const app = express();
app.use(cors());
app.use(express.json());
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const PORT = process.env.PORT || 5002;

app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API Projet Soutenance (scope prof)",
    endpoints: {
      'GET /': 'Cette page',
      'GET /test': 'Page de test inscription',
      'GET /logout': 'Page de déconnexion',
      'GET /api/users': 'Afficher tous les utilisateurs',
      'GET /api/users/plusieurs?ids=1,2,3': 'Afficher plusieurs utilisateurs',
      'GET /api/users/:id': 'Afficher un utilisateur',
      'POST /api/users/register': 'Inscription (créer un utilisateur)',
      'PUT /api/users/:id': 'Modifier un utilisateur',
      'DELETE /api/users/:id': 'Supprimer un utilisateur',
      'POST /api/auth/login': 'Connexion',
      'POST /api/auth/refresh': "Renouveler l'access token",
      'POST /api/auth/logout': 'Déconnexion',
      'POST /api/iot/update':
        'Simulation ESP32 → met à jour DispositifIoT, Bac, Remplissage et déclenche/résout les alertes bac_plein (pas de POST /api/alertes)',
      'GET /api/alertes': 'Liste des alertes (créées automatiquement par IoT)',
      'POST /api/collectes': 'Créer une collecte (collecteur ; admin autorisé comme collecteur)',
      'POST /api/signalements': 'Créer un signalement (citoyen ; admin autorisé comme citoyen)',
      'GET /api/camions': 'Lister les camions',
      'GET /api/reclamations': 'Lister les reclamations',
      'GET /api/zones-risque': 'Lister les zones à risque',
      'GET /api/localisations': 'Lister les localisations',
      'POST /api/localisations': 'Créer une localisation (admin) : adresse + quartier (texte libre)',
    },
    relations: {
      'Utilisateur 1-n Collecte': 'collectes.idUtilisateur -> utilisateurs.id',
      'Bac 1-n Collecte': 'collectes.idBac -> bacs.id',
      'Bac 1-n DispositifIoT': 'dispositifs_iot.idBac -> bacs.id',
      'Utilisateur 1-n Signalement': 'signalements.idUtilisateur -> utilisateurs.id',
      'Bac 1-n Signalement': 'signalements.idBac -> bacs.id',
      'Alerte 1-n Signalement': 'signalements.idAlerte -> alertes.id',
      'Utilisateur 1-n Reclamation': 'reclamations.idUtilisateur -> utilisateurs.id',
      'Localisation -> Quartier': 'localisations.quartier (texte)',
      'Localisation -> Departement': 'localisations.departement (champ texte)',
      'Localisation -> Itineraire': 'localisations.itineraire (champ texte)',
      'ZoneRisque 1-n Localisation': 'localisations.id_zone_risque -> zones_risque.id (API JSON: idZoneRisque)',
    },
  });
});

app.get('/test', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Test inscription</title></head>
<body style="font-family:sans-serif; max-width:400px; margin:2rem auto; padding:1rem;">
  <h1>Test inscription</h1>
  <p style="font-size:0.9rem;color:#444;">L’inscription API exige un <strong>token admin</strong> (connectez-vous via <code>POST /api/auth/login</code>).</p>
  <label>Token admin (Bearer) <input name="adminToken" id="adminToken" type="password" placeholder="coller le JWT" style="width:100%"></label>
  <form id="form" style="display:flex;flex-direction:column;gap:0.5rem;">
    <label>Nom <input name="nom" required></label>
    <label>Email <input name="email" type="email" required></label>
    <label>Mot de passe <input name="motDePasse" type="password" required></label>
    <label>Rôle
      <select name="role">
        <option value="citoyen">citoyen</option>
        <option value="collecteur">collecteur</option>
        <option value="admin">admin</option>
      </select>
    </label>
    <button type="submit">S'inscrire</button>
  </form>
  <pre id="result" style="background:#f0f0f0; padding:1rem; margin-top:1rem; white-space:pre-wrap;"></pre>
  <script>
    document.getElementById('form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd);
      const pre = document.getElementById('result');
      try {
        const token = (document.getElementById('adminToken') || {}).value || '';
        const r = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token.trim() } : {}),
          },
          body: JSON.stringify(body)
        });
        const data = await r.json();
        pre.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        pre.textContent = 'Erreur: ' + err.message;
      }
    };
  </script>
</body>
</html>
  `);
});

app.get('/logout', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Déconnexion</title></head>
<body style="font-family:sans-serif; max-width:480px; margin:2rem auto; padding:1rem;">
  <h1>Déconnexion</h1>
  <p>Cette page envoie <code>POST /api/auth/logout</code> puis supprime le token local.</p>
  <button id="btnLogout">Se déconnecter</button>
  <pre id="result" style="background:#f0f0f0; padding:1rem; margin-top:1rem; white-space:pre-wrap;"></pre>
  <script>
    document.getElementById('btnLogout').onclick = async () => {
      const pre = document.getElementById('result');
      const token = localStorage.getItem('token') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      try {
        const r = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: 'Bearer ' + token } : {}),
            ...(refreshToken ? { 'Content-Type': 'application/json' } : {})
          },
          body: refreshToken ? JSON.stringify({ refreshToken }) : undefined
        });
        const data = await r.json();
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        pre.textContent = JSON.stringify({
          message: data.message || 'Déconnexion réussie',
          info: 'Token + refreshToken supprimés du localStorage'
        }, null, 2);
      } catch (err) {
        pre.textContent = 'Erreur: ' + err.message;
      }
    };
  </script>
</body>
</html>
  `);
});

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

async function bootstrapAdmin() {
  // Crée les rôles de base si absents
  const [adminRole] = await Role.findOrCreate({ where: { nom: 'admin' } });
  await Role.findOrCreate({ where: { nom: 'citoyen' } });
  await Role.findOrCreate({ where: { nom: 'collecteur' } });

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@test.com';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const adminNom = process.env.DEFAULT_ADMIN_NOM || 'Admin';
  const adminPrenom = process.env.DEFAULT_ADMIN_PRENOM || 'System';

  // Crée l'utilisateur admin s'il n'existe pas encore
  const [adminUser, created] = await Utilisateur.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      nom: adminNom,
      prenom: adminPrenom,
      email: adminEmail,
      etat: true,
      role: 'admin',
      localisation: 'Dakar',
      idRole: adminRole.id,
    },
  });

  // Met à jour (ou crée) les identifiants de connexion admin
  // Important : findOrCreate ne met pas à jour si la ligne existe déjà.
  const existingAuth = await Authentification.findOne({
    where: { idUtilisateur: adminUser.id },
  });
  if (!existingAuth) {
    const hashedAdminPassword = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
    await Authentification.create({
      idUtilisateur: adminUser.id,
      login: adminEmail,
      mdPasse: hashedAdminPassword,
    });
  } else {
    const hashedAdminPassword = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
    await existingAuth.update({
      login: adminEmail,
      mdPasse: hashedAdminPassword,
    });
  }

  if (created) console.log(`✅ Compte admin créé: ${adminEmail}`);
  else console.log(`✅ Compte admin mis à jour: ${adminEmail}`);
}

async function start() {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log('Tables synchronisées avec Postgres');
    await bootstrapAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Démarrage impossible :', err?.message || err);
    process.exit(1);
  }
}

start();
