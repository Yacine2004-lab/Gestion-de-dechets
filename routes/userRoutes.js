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

router.get('/', userCtrl.getAllUsers);
router.get('/plusieurs', idsQueryValidator, validateRequest, userCtrl.getUsers);   // ?ids=1,2,3
router.get('/:id', idParamValidator, validateRequest, userCtrl.getUserById);
router.post('/register', authRequired, adminOnly, registerValidator, validateRequest, userCtrl.createUser);
router.put('/:id', authRequired, updateUserValidator, validateRequest, userCtrl.updateUser);
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, userCtrl.deleteUser);

module.exports = router;
