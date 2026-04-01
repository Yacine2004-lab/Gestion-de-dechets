const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alerteController');
const { authRequired, adminOnly } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { idParamValidator, alerteUpdateValidator } = require('../middleware/validators');

router.get('/', authRequired, ctrl.list);
router.get('/:id', authRequired, idParamValidator, validateRequest, ctrl.getById);
// Pas de POST : les alertes « bac plein » sont créées uniquement par POST /api/iot/update
router.put('/:id', authRequired, adminOnly, alerteUpdateValidator, validateRequest, ctrl.update);
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;

