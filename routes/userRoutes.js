const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const { authRequired, adminOnly } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  idParamValidator,
  idsQueryValidator,
  registerValidator,
  updateUserValidator,
} = require('../middleware/validators');

// --- ROUTES RÉSERVÉES À L'ADMIN ---

// Seul l'admin peut lister tous les utilisateurs ou plusieurs à la fois
router.get('/', authRequired, adminOnly, userCtrl.getAllUsers);
router.get('/plusieurs', authRequired, adminOnly, idsQueryValidator, validateRequest, userCtrl.getUsers); // ?ids=1,2,3

// Inscription et suppression (déjà bien protégées dans ton code)
router.post('/register', authRequired, adminOnly, registerValidator, validateRequest, userCtrl.createUser);
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, userCtrl.deleteUser);


// --- ROUTES ACCESSIBLES PAR TOUS (Connectés) ---

// Un agent ou citoyen peut voir les détails d'un profil (le sien ou un collègue selon ton controller)
router.get('/:id', authRequired, idParamValidator, validateRequest, userCtrl.getUserById);

// Un utilisateur peut modifier ses infos (le middleware authRequired est crucial ici)
router.put('/:id', authRequired, updateUserValidator, validateRequest, userCtrl.updateUser);

module.exports = router;