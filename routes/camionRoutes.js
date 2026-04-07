const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/camionController');
// On ajoute roleAllowed pour la gestion fine des accès
const { authRequired, adminOnly, roleAllowed } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { idParamValidator, camionCreateValidator, camionUpdateValidator } = require('../middleware/validators');

// --- LECTURE (SÉCURISÉE) ---
// Seuls l'Admin et le Collecteur (Agent) peuvent voir la liste des camions.
// Le Citoyen est désormais bloqué (403 Forbidden).
router.get('/', authRequired, roleAllowed(['admin', 'collecteur']), ctrl.list);

router.get('/:id', authRequired, roleAllowed(['admin', 'collecteur']), idParamValidator, validateRequest, ctrl.getById);

// --- GESTION DE LA FLOTTE (ADMIN SEUL) ---
// Seul l'Admin peut ajouter, modifier ou supprimer un camion du système.
router.post('/', authRequired, adminOnly, camionCreateValidator, validateRequest, ctrl.create);

router.put('/:id', authRequired, adminOnly, camionUpdateValidator, validateRequest, ctrl.update);

router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;