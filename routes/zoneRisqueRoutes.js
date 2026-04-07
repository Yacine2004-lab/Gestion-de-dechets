const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/zoneRisqueController');
// On s'assure d'importer roleAllowed pour la lecture flexible
const { authRequired, adminOnly, roleAllowed } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { idParamValidator, zoneRisqueCreateValidator } = require('../middleware/validators');

// --- LECTURE (SÉCURISÉE) ---
// On autorise l'Admin et le Collecteur (Agent) à voir les zones critiques.
// Le Citoyen recevra un 403 Forbidden s'il essaie cette route.
router.get('/', authRequired, roleAllowed(['admin', 'collecteur']), ctrl.list);

router.get('/:id', authRequired, roleAllowed(['admin', 'collecteur']), idParamValidator, validateRequest, ctrl.getById);

// --- ACTIONS DE GESTION (ADMIN SEUL) ---
// Seul l'Admin peut définir quelle zone de Dakar est "à risque" ou modifier ses limites.
router.post('/', authRequired, adminOnly, zoneRisqueCreateValidator, validateRequest, ctrl.create);

router.put('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.update);

router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;