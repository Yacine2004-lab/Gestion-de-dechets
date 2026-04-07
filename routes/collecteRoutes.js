const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/collecteController');
const { authRequired, roleAllowed } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { idParamValidator, collecteCreateValidator, collecteUpdateValidator } = require('../middleware/validators');

// --- LECTURE (SÉCURISÉE) ---
// Liste des missions pour l'Admin et le Collecteur
router.get('/', authRequired, roleAllowed(['admin', 'collecteur']), ctrl.list);

// Voir une mission spécifique
router.get('/:id', authRequired, roleAllowed(['admin', 'collecteur']), idParamValidator, validateRequest, ctrl.getById);

// --- ACTIONS OPÉRATIONNELLES ---
// Création d'une mission de collecte
router.post('/', authRequired, roleAllowed(['admin', 'collecteur']), collecteCreateValidator, validateRequest, ctrl.create);

/**
 * ✅ ACTION CRUCIALÈ : Validation de la fin de ramassage
 * Cette route va déclencher la fonction qui :
 * 1. Termine la collecte
 * 2. Passe l'alerte du bac à 'RESOLUE'
 * 3. Remet le niveau du bac à 0%
 */
router.put('/valider/:id', authRequired, roleAllowed(['collecteur', 'admin']), idParamValidator, validateRequest, ctrl.validerCollecte);

// --- SUPPRESSION ---
// Seul l'Admin peut supprimer une mission
router.delete('/:id', authRequired, roleAllowed(['admin']), idParamValidator, validateRequest, ctrl.remove);

module.exports = router;