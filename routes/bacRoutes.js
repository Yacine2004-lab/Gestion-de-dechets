const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bacController');
const { authRequired, adminOnly } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { idParamValidator, bacCreateValidator, bacUpdateValidator } = require('../middleware/validators');

router.get('/', authRequired, ctrl.list);
router.get('/:id', authRequired, idParamValidator, validateRequest, ctrl.getById);
router.post('/', authRequired, adminOnly, bacCreateValidator, validateRequest, ctrl.create);
router.put('/:id', authRequired, adminOnly, bacUpdateValidator, validateRequest, ctrl.update);
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;

