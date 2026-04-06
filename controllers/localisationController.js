const { Localisation } = require('../models');
const { crudController, sendWriteError } = require('./crudFactory');

const ALLOWED = [
  'adresse',
  'quartier',
  'latitude',
  'longitude',
  'departement',
  'itineraire',
  'idZoneRisque',
];

function pickDefined(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/**
 * Accepte camelCase (API) et snake_case (habitude SQL / Postman).
 * Corrige les cas où pick(req.body) ne voyait pas id_zone_risque / clé accentuée.
 */
function normalizeLocalisationBody(body) {
  if (!body || typeof body !== 'object') return {};
  const b = { ...body };
  if (b.idZoneRisque === undefined && b.id_zone_risque !== undefined) {
    b.idZoneRisque = b.id_zone_risque;
  }
  if (b.itineraire === undefined && b.itinéraire !== undefined) {
    b.itineraire = b.itinéraire;
  }
  if (b.itineraire != null && typeof b.itineraire !== 'string') {
    b.itineraire = String(b.itineraire);
  }
  if (b.idZoneRisque != null && b.idZoneRisque !== '') {
    const n = parseInt(String(b.idZoneRisque), 10);
    b.idZoneRisque = Number.isNaN(n) ? b.idZoneRisque : n;
  }
  return b;
}

const base = crudController(Localisation, ALLOWED);

module.exports = {
  ...base,
  create: async (req, res) => {
    try {
      const data = pickDefined(normalizeLocalisationBody(req.body), ALLOWED);
      const item = await Localisation.create(data);
      return res.status(201).json(item);
    } catch (error) {
      return sendWriteError(res, error, 'Erreur lors de la création');
    }
  },
  update: async (req, res) => {
    try {
      const item = await Localisation.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: 'Introuvable' });
      const data = pickDefined(normalizeLocalisationBody(req.body), ALLOWED);
      await item.update(data);
      return res.status(200).json(item);
    } catch (error) {
      return sendWriteError(res, error, 'Erreur lors de la modification');
    }
  },
};
