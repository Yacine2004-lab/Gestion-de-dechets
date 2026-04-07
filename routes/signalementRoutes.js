const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/signalementController');
const { authRequired, roleAllowed, adminOnly } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  idParamValidator,
  signalementCreateValidator,
  signalementUpdateValidator,
} = require('../middleware/validators');

// --- LECTURE (SÉCURISÉE) ---
// Seuls l'Admin et l'Agent (Collecteur) voient la liste des problèmes à régler.
router.get('/', authRequired, roleAllowed(['admin', 'collecteur']), ctrl.list);

router.get('/:id', authRequired, roleAllowed(['admin', 'collecteur']), idParamValidator, validateRequest, ctrl.getById);

// --- CRÉATION (CITOYEN) ---
// C'est l'action principale du citoyen : rapporter un problème sur le terrain.
router.post('/', authRequired, roleAllowed(['citoyen']), signalementCreateValidator, validateRequest, ctrl.create);

// --- MODIFICATION / TRAITEMENT ---
// Un citoyen ne doit pas pouvoir modifier un signalement une fois envoyé (risque de fraude).
// On réserve la modification (ex: changer le statut en "Traité") à l'Admin ou l'Agent.
router.put('/:id', authRequired, roleAllowed(['admin', 'collecteur']), signalementUpdateValidator, validateRequest, ctrl.update);

// --- SUPPRESSION (ADMIN SEUL) ---
// La suppression définitive d'un signalement est une action d'archivage réservée à l'Admin.
router.delete('/:id', authRequired, adminOnly, idParamValidator, validateRequest, ctrl.remove);

module.exports = router;