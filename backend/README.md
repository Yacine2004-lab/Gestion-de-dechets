# Backend - API Projet Soutenance

## Structure du projet

```
Projet soutenance/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── userController.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── userRoutes.js
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── README.md
├── package.json          ← "npm start" lance le backend
├── package-lock.json
└── node_modules/
```

## Lancer le serveur

À la racine du projet (Projet soutenance) :

```bash
npm start
```

Le serveur écoute sur http://localhost:5002 (voir `backend/.env`).

## Endpoints

- `GET /` — Page d'accueil API
- `GET /test` — Formulaire de test inscription
- `GET /api/users` — Liste des utilisateurs
- `POST /api/users/register` — Créer un utilisateur
