const express = require('express');
const router = express.Router();
const iotCtrl = require('../controllers/iotController');
const { validateRequest } = require('../middleware/validateRequest');
const { iotUpdateValidator } = require('../middleware/validators');

// --- ROUTES POUR LES REMPLISSAGES (IoT) ---

// 1. Récupérer tous les remplissages (Historique)
// URL: GET http://localhost:5002/api/iot
router.get('/', iotCtrl.getAll);

// 2. Récupérer un remplissage spécifique par son ID
// URL: GET http://localhost:5002/api/iot/:id
router.get('/:id', iotCtrl.getOne);

// 3. Simulation ESP32 (Ajout/Mise à jour via capteur)
// URL: POST http://localhost:5002/api/iot/update
router.post('/update', iotUpdateValidator, validateRequest, iotCtrl.update);

// 4. Modifier manuellement un enregistrement
// URL: PUT http://localhost:5002/api/iot/:id
router.put('/:id', iotUpdateValidator, validateRequest, iotCtrl.updateManual);

// 5. Supprimer un enregistrement de remplissage
// URL: DELETE http://localhost:5002/api/iot/:id
router.delete('/:id', iotCtrl.delete);

module.exports = router;