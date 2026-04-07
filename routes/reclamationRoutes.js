const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reclamationController');
// On utilise roleAllowed pour une gestion précise
const { authRequired, adminOnly, roleAllowed } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  idParamValidator,
  reclamationCreateValidator,
  reclamationUpdateValidator,
} = require('../middleware/validators');

// --- LECTURE (SÉCURISÉE) ---
// Seul l'Admin peut lister TOUTES les réclamations pour les traiter.
// Note : Dans ton controller 'list', tu devrais filtrer pour que le citoyen 
// ne voie que les siennes s'il appelle cette route, ou restreindre ici à l'admin.
router.get('/', authRequired, roleAllowed(['admin']), ctrl.list);

// Détail d'une réclamation : l'Admin ou l'auteur (logique à gérer dans le controller)
router.get('/:id', authRequired, idParamValidator, validateRequest, ctrl.getById);

// --- CRÉATION ---
// Tout le monde peut envoyer une réclamation (Citoyen, Agent ou Admin)
router.post('/', authRequired, reclamationCreateValidator, validateRequest, ctrl.create);

// --- GESTION (ADMIN SEUL) ---
// Seul l'Admin peut répondre ou mettre à jour le statut d'une réclamation (ex: "Traitée")
router.put('/:id', authRequired, adminOnly, reclamationUpdateValidator, validateRequest, ctrl.update);

// Seul l'Admin peut supprimer une réclamation
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;