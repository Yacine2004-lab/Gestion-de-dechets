const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/signalementController');
const { authRequired, roleAllowed } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  idParamValidator,
  signalementCreateValidator,
  signalementUpdateValidator,
} = require('../middleware/validators');

router.get('/', authRequired, ctrl.list);
router.get('/:id', authRequired, idParamValidator, validateRequest, ctrl.getById);
// seul citoyen peut créer un signalement
router.post('/', authRequired, roleAllowed(['citoyen']), signalementCreateValidator, validateRequest, ctrl.create);
// seul citoyen peut modifier/supprimer ses signalements
router.put('/:id', authRequired, roleAllowed(['citoyen']), signalementUpdateValidator, validateRequest, ctrl.update);
router.delete('/:id', authRequired, roleAllowed(['citoyen']), idParamValidator, validateRequest, ctrl.remove);

module.exports = router;

