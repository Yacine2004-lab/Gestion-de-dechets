const { body, param, query } = require('express-validator');

const ROLES = ['admin', 'collecteur', 'citoyen'];
const DispositifIoTModel = require('../models/DispositifIoT');
const TYPE_CAPTEURS = DispositifIoTModel.TYPE_CAPTEURS;

// ✅ Listes des ENUMS pour Dakar (doivent correspondre à tes modèles)
const COMMUNES_DAKAR = [
  'Dakar Plateau', 'Médina', 'Fann-Point E', 'Ouakam', 'Ngor', 
  'Yoff', 'Grand Yoff', 'Parcelles Assainies', 'Pikine', 'Guédiawaye',
  'Rufisque', 'Thiaroye', 'Sangalkam', 'Hann Bel-Air'
];
// ✅ Ajout de la liste des départements
const DEPARTEMENTS_DAKAR = ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'];

const STATUTS_BAC = ['actif', 'maintenance', 'hors-service'];
const STATUTS_ALERTE = ['OUVERTE', 'RESOLUE', 'ARCHIVEE'];

const idParamValidator = [param('id').isInt({ min: 1 }).withMessage('id doit être un entier > 0')];

const idsQueryValidator = [
  query('ids')
    .matches(/^\d+(,\d+)*$/)
    .withMessage('ids doit être une liste d entiers séparés par des virgules (ex: 1,2,3)'),
];

const loginValidator = [
  body('login').isEmail().withMessage('login doit être un email valide'),
  body('mdPasse').isString().isLength({ min: 4 }).withMessage('mdPasse est obligatoire (min 4)'),
];

const refreshValidator = [body('refreshToken').isString().notEmpty().withMessage('refreshToken requis')];

const registerValidator = [
  body('nom').isString().trim().notEmpty().withMessage('nom est obligatoire'),
  body('email').isEmail().withMessage('email invalide'),
  body('motDePasse').isString().isLength({ min: 4 }).withMessage('motDePasse min 4 caractères'),
  body('role')
    .optional()
    .isIn(ROLES)
    .withMessage('role invalide (admin, collecteur, citoyen)'),
  body('telephone').optional({ nullable: true }).isString().withMessage('telephone doit être une chaîne'),
  body('localisation').optional({ nullable: true }).isString().withMessage('localisation doit être une chaîne'),
];

const updateUserValidator = [
  ...idParamValidator,
  body('email').optional().isEmail().withMessage('email invalide'),
  body('role')
    .optional()
    .isIn(ROLES)
    .withMessage('role invalide (admin, collecteur, citoyen)'),
  body('idRole').optional({ nullable: true }).isInt({ min: 1 }).withMessage('idRole doit être un entier > 0'),
  body('etat').optional().isBoolean().withMessage('etat doit être booléen'),
  body('telephone').optional({ nullable: true }).isString().withMessage('telephone invalide'),
  body('localisation').optional({ nullable: true }).isString().withMessage('localisation invalide'),
];

const bacCreateValidator = [
  body('localisation')
    .isIn(COMMUNES_DAKAR)
    .withMessage(`La localisation doit être l'une des communes suivantes : ${COMMUNES_DAKAR.join(', ')}`),
  body('capacite').optional().isFloat({ min: 0 }).withMessage('capacite doit être >= 0'),
  body('tauxRemplissage').optional().isFloat({ min: 0, max: 100 }).withMessage('tauxRemplissage 0-100'),
  body('statut')
    .optional()
    .isIn(STATUTS_BAC)
    .withMessage('statut invalide (actif, maintenance, hors-service)'),
];

const bacUpdateValidator = [
  ...idParamValidator,
  body('localisation')
    .optional()
    .isIn(COMMUNES_DAKAR)
    .withMessage('Commune de Dakar invalide'),
  body('capacite').optional().isFloat({ min: 0 }).withMessage('capacite doit être >= 0'),
  body('tauxRemplissage').optional().isFloat({ min: 0, max: 100 }).withMessage('tauxRemplissage 0-100'),
  body('statut')
    .optional()
    .isIn(STATUTS_BAC)
    .withMessage('statut invalide'),
];

const dispositifCreateValidator = [
  body('typeCapteur')
    .isIn(TYPE_CAPTEURS)
    .withMessage('typeCapteur invalide (ultrason, ESP-32)'),
  body('idBac').isInt({ min: 1 }).withMessage('idBac doit être un entier > 0'),
  body('batterie').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('batterie 0-100'),
];

const dispositifUpdateValidator = [
  ...idParamValidator,
  body('typeCapteur')
    .optional()
    .isIn(TYPE_CAPTEURS)
    .withMessage('typeCapteur invalide (ultrason, ESP-32)'),
  body('idBac').optional().isInt({ min: 1 }).withMessage('idBac doit être un entier > 0'),
  body('batterie').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('batterie 0-100'),
];

const iotUpdateValidator = [
  body('id_serie').optional().isString().trim().notEmpty().withMessage('id_serie invalide'),
  body('idSerie').optional().isString().trim().notEmpty().withMessage('idSerie invalide'),
  body('distance_cm').isFloat({ min: 0, max: 1000 }).withMessage('distance_cm doit être un nombre >= 0'),
  body('batterie').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('batterie 0-100'),
  body().custom((v) => {
    if (!v || (!v.id_serie && !v.idSerie)) {
      throw new Error('id_serie (ou idSerie) est obligatoire');
    }
    return true;
  }),
];

const collecteCreateValidator = [
  body('idBac').isInt({ min: 1 }).withMessage('idBac doit être un entier > 0'),
  body('idUtilisateur').optional().isInt({ min: 1 }).withMessage('idUtilisateur doit être un entier > 0'),
  body('date').optional().isISO8601().withMessage('date invalide (ISO8601)'),
];

const collecteUpdateValidator = [
  ...idParamValidator,
  body('idBac').optional().isInt({ min: 1 }).withMessage('idBac doit être un entier > 0'),
  body('date').optional().isISO8601().withMessage('date invalide (ISO8601)'),
];

const alerteUpdateValidator = [
  ...idParamValidator,
  body('idBac').optional({ nullable: true }).isInt({ min: 1 }).withMessage('idBac doit être un entier > 0'),
  body('type').optional().isString().trim().notEmpty().withMessage('type invalide'),
  body('niveauUrgence').optional().isIn(['faible', 'moyen', 'eleve']).withMessage('niveauUrgence invalide'),
  body('statut')
    .optional()
    .isIn(STATUTS_ALERTE)
    .withMessage('statut invalide (OUVERTE, RESOLUE, ARCHIVEE)'),
  body('date').optional().isISO8601().withMessage('date invalide (ISO8601)'),
];

const signalementCreateValidator = [
  body('idBac').optional({ nullable: true }).isInt({ min: 1 }).withMessage('idBac doit être un entier > 0'),
  body('idAlerte').optional({ nullable: true }).isInt({ min: 1 }).withMessage('idAlerte doit être un entier > 0'),
  body('type').optional().isString().trim().notEmpty().withMessage('type invalide'),
  body('description').isString().trim().notEmpty().withMessage('description obligatoire'),
  body('statut').optional().isString().trim().notEmpty().withMessage('statut invalide'),
  body('date').optional().isISO8601().withMessage('date invalire (ISO8601)'),
];

const signalementUpdateValidator = [
  ...idParamValidator,
  body('idBac').optional({ nullable: true }).isInt({ min: 1 }).withMessage('idBac doit être un entier > 0'),
  body('idAlerte').optional({ nullable: true }).isInt({ min: 1 }).withMessage('idAlerte doit être un entier > 0'),
  body('type').optional().isString().trim().notEmpty().withMessage('type invalide'),
  body('description').optional().isString().trim().notEmpty().withMessage('description invalide'),
  body('statut').optional().isString().trim().notEmpty().withMessage('statut invalide'),
  body('date').optional().isISO8601().withMessage('date invalide (ISO8601)'),
];

const zoneRisqueCreateValidator = [
  body('niveauRisque').optional().isString().trim().notEmpty().withMessage('niveauRisque invalide'),
  body('cause').optional({ nullable: true }).isString().withMessage('cause invalide'),
];

// ✅ LOCALISATION : Intégration des ENUMS Quartier et Département
const localisationCreateValidator = [
  body('adresse').isString().trim().notEmpty().withMessage('adresse obligatoire'),
  body('quartier').isIn(COMMUNES_DAKAR).withMessage("Le quartier n'est pas dans la liste autorisée"),
  body('latitude').optional({ nullable: true }).isFloat().withMessage('latitude invalide'),
  body('longitude').optional({ nullable: true }).isFloat().withMessage('longitude invalide'),
  body('departement').isIn(DEPARTEMENTS_DAKAR).withMessage("Département invalide (Dakar, Pikine, Guédiawaye, Rufisque)"),
  body('itineraire').optional({ nullable: true }).isString().withMessage('itineraire invalide'),
  body('id_zone_risque').optional({ nullable: true }).isInt({ min: 1 }).withMessage('id_zone_risque doit être un entier > 0'),
];

const localisationUpdateValidator = [
  ...idParamValidator,
  body('adresse').optional().isString().trim().notEmpty().withMessage('adresse invalide'),
  body('quartier').optional().isIn(COMMUNES_DAKAR).withMessage("Quartier non reconnu"),
  body('latitude').optional({ nullable: true }).isFloat().withMessage('latitude invalide'),
  body('longitude').optional({ nullable: true }).isFloat().withMessage('longitude invalide'),
  body('departement').optional().isIn(DEPARTEMENTS_DAKAR).withMessage("Département invalide"),
  body('id_zone_risque').optional({ nullable: true }).isInt({ min: 1 }).withMessage('id_zone_risque doit être un entier > 0'),
];

const camionCreateValidator = [
  body('immatriculation').isString().trim().notEmpty().withMessage('immatriculation obligatoire'),
  body('etat').optional().isString().trim().notEmpty().withMessage('etat invalide'),
  body('capacite').optional().isFloat({ min: 0 }).withMessage('capacite doit être >= 0'),
  body('idItineraire').optional({ nullable: true }).isInt({ min: 1 }).withMessage('idItineraire doit être un entier > 0'),
];

const camionUpdateValidator = [...idParamValidator, ...camionCreateValidator];

const reclamationCreateValidator = [
  body('description').isString().trim().notEmpty().withMessage('description obligatoire'),
  body('statut').optional().isString().trim().notEmpty().withMessage('statut invalide'),
  body('date').optional().isISO8601().withMessage('date invalide (ISO8601)'),
];

const reclamationUpdateValidator = [...idParamValidator, ...reclamationCreateValidator];

module.exports = {
  idParamValidator,
  idsQueryValidator,
  loginValidator,
  refreshValidator,
  registerValidator,
  updateUserValidator,
  bacCreateValidator,
  bacUpdateValidator,
  dispositifCreateValidator,
  dispositifUpdateValidator,
  iotUpdateValidator,
  collecteCreateValidator,
  collecteUpdateValidator,
  alerteUpdateValidator,
  signalementCreateValidator,
  signalementUpdateValidator,
  zoneRisqueCreateValidator,
  localisationCreateValidator,
  localisationUpdateValidator,
  camionCreateValidator,
  camionUpdateValidator,
  reclamationCreateValidator,
  reclamationUpdateValidator,
};