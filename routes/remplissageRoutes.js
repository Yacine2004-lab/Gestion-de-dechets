const express = require('express');
const router = express.Router();
const iotCtrl = require('../controllers/iotController');
// Importation des middlewares de sécurité
const { authRequired, adminOnly, roleAllowed } = require('../middleware/auth');

// --- LECTURE (SÉCURISÉE) ---
// Seuls l'Admin (pour les stats) et l'Agent (pour voir l'état actuel) y ont accès.
// Le Citoyen est bloqué : il doit passer par /api/bacs pour voir l'état simplifié.
router.get('/', authRequired, roleAllowed(['admin', 'collecteur']), iotCtrl.getAll);

router.get('/:id', authRequired, roleAllowed(['admin', 'collecteur']), iotCtrl.getOne);

// --- ACTIONS DE MAINTENANCE (ADMIN SEUL) ---
// Modifier manuellement une valeur de capteur ou supprimer un historique 
// est une action critique réservée à l'administrateur.
router.put('/:id', authRequired, adminOnly, iotCtrl.updateManual);

router.delete('/:id', authRequired, adminOnly, iotCtrl.delete);

module.exports = router;