const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alerteController');
const { authRequired, adminOnly } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { idParamValidator, alerteUpdateValidator } = require('../middleware/validators');

// ✅ ROUTE PRINCIPALE : Affiche TOUTES les alertes (Actives et Résolues)
// URL: GET http://localhost:5002/api/alertes/
router.get('/', authRequired, ctrl.list);

// ✅ ROUTE DÉTAIL : Voir une alerte spécifique par son ID
// URL: GET http://localhost:5002/api/alertes/11
router.get('/:id', authRequired, idParamValidator, validateRequest, ctrl.getById);

// ⚠️ Note : Pas de POST ici car les alertes sont créées par le système IoT
// (via le endpoint /api/iot/update que tu as déjà configuré)

// ✅ ROUTE MODIFICATION : Réservée à l'Admin
router.put('/:id', authRequired, adminOnly, alerteUpdateValidator, validateRequest, ctrl.update);

// ✅ ROUTE SUPPRESSION : Réservée à l'Admin
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;