const express = require('express');
const router = express.Router();
const iotCtrl = require('../controllers/iotController');
const { validateRequest } = require('../middleware/validateRequest');
const { iotUpdateValidator } = require('../middleware/validators');

// Simulation ESP32
router.post('/update', iotUpdateValidator, validateRequest, iotCtrl.update);

module.exports = router;

