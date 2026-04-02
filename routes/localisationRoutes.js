const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/localisationController');
const { authRequired, adminOnly } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  idParamValidator,
  localisationCreateValidator,
  localisationUpdateValidator,
} = require('../middleware/validators');

router.get('/', authRequired, ctrl.list);
router.get('/:id', authRequired, idParamValidator, validateRequest, ctrl.getById);
router.post('/', authRequired, adminOnly, localisationCreateValidator, validateRequest, ctrl.create);
router.put('/:id', authRequired, adminOnly, localisationUpdateValidator, validateRequest, ctrl.update);
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;
