const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { loginValidator, refreshValidator } = require('../middleware/validators');

router.post('/login', loginValidator, validateRequest, authCtrl.login);
router.post('/refresh', refreshValidator, validateRequest, authCtrl.refresh);
router.post('/logout', authCtrl.logout);
router.get('/me', authRequired, authCtrl.me);

module.exports = router;
