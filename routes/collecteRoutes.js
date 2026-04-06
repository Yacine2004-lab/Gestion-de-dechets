const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/collecteController');
const { authRequired, roleAllowed } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { idParamValidator, collecteCreateValidator, collecteUpdateValidator } = require('../middleware/validators');

// Collecteur ; l'admin est toujours autorisé sur création / modification (middleware roleAllowed)
router.get('/', authRequired, ctrl.list);
router.get('/:id', authRequired, idParamValidator, validateRequest, ctrl.getById);
router.post('/', authRequired, roleAllowed(['collecteur']), collecteCreateValidator, validateRequest, ctrl.create);
router.put('/:id', authRequired, roleAllowed(['collecteur']), collecteUpdateValidator, validateRequest, ctrl.update);
router.delete('/:id', authRequired, roleAllowed(['admin']), idParamValidator, validateRequest, ctrl.remove);

module.exports = router;

