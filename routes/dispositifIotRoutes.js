const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dispositifIotController'); // Vérifie bien le nom du fichier contrôleur
const { authRequired, adminOnly } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  idParamValidator,
  dispositifCreateValidator,
  dispositifUpdateValidator,
} = require('../middleware/validators');

// --- ROUTES POUR LA GESTION DES DISPOSITIFS (ADMIN) ---

// 1. Lister tous les dispositifs (Ex: pour voir quel capteur est sur quel bac)
router.get('/', authRequired, ctrl.list);

// 2. Voir un dispositif précis par son ID
router.get('/:id', authRequired, idParamValidator, validateRequest, ctrl.getById);

// 3. Créer un nouveau dispositif (Réservé à l'admin)
router.post('/', authRequired, adminOnly, dispositifCreateValidator, validateRequest, ctrl.create);

// 4. Modifier un dispositif (Changer le bac associé, etc.)
router.put('/:id', authRequired, adminOnly, dispositifUpdateValidator, validateRequest, ctrl.update);

// 5. Supprimer un dispositif
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;