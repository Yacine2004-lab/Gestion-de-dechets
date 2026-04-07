const { Sequelize } = require('sequelize');
const { DispositifIoT, Bac, Remplissage, Alerte } = require('../models');

/** * Clé de comparaison : casse ignorée, underscore et tiret équivalents 
 */
function idSerieCompareKey(s) {
  return String(s).trim().toLowerCase().replace(/_/g, '-');
}

// --- 1. RÉCUPÉRER TOUT (GET /api/remplissages) ---
exports.getAll = async (req, res) => {
  try {
    const remplissages = await Remplissage.findAll({
      order: [['createdAt', 'DESC']], 
      include: [
        { model: Bac, attributes: ['id', 'tauxRemplissage'] },
        { model: DispositifIoT, attributes: ['idSerie', 'typeCapteur'] }
      ]
    });
    return res.status(200).json(remplissages);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Erreur lors de la récupération des remplissages', 
      error: error.message 
    });
  }
};

// --- 2. RÉCUPÉRER UN SEUL (GET /api/remplissages/:id) ---
exports.getOne = async (req, res) => {
  try {
    const item = await Remplissage.findByPk(req.params.id, {
      include: [Bac, DispositifIoT]
    });
    if (!item) return res.status(404).json({ message: 'Enregistrement introuvable' });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur de récupération', error: error.message });
  }
};

// --- 3. MISE À JOUR VIA CAPTEUR (POST /api/iot/update) ---
exports.update = async (req, res) => {
  try {
    const idSerieBody = req.body.id_serie ?? req.body.idSerie;
    const { distance_cm, batterie } = req.body;

    if (!idSerieBody || distance_cm === undefined) {
      return res.status(400).json({ message: 'id_serie et distance_cm sont obligatoires' });
    }

    const idSerieNorm = String(idSerieBody).trim();
    
    const dispositif = await DispositifIoT.findOne({
      where: Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.fn('REPLACE', Sequelize.col('idSerie'), '_', '-')),
        idSerieCompareKey(idSerieNorm)
      ),
    });

    if (!dispositif) return res.status(404).json({ message: 'Dispositif IoT introuvable' });

    const bac = await Bac.findByPk(dispositif.idBac);
    if (!bac) return res.status(404).json({ message: 'Bac lié au dispositif introuvable' });

    // Calcul du niveau numérique
    const hauteurMaxCm = 100;
    const distance = Number(distance_cm);
    let niveau = ((hauteurMaxCm - distance) / hauteurMaxCm) * 100;
    niveau = Math.max(0, Math.min(100, isNaN(niveau) ? 0 : niveau));
    
    // On arrondit à 2 décimales et on convertit en type Nombre
    const niveauNumerique = Number(niveau.toFixed(2));

    // MISE À JOUR NUMÉRIQUE DU DISPOSITIF
    await dispositif.update({
      niveauMesure: niveauNumerique, 
      batterie: batterie !== undefined ? Number(batterie) : dispositif.batterie,
    });

    // MISE À JOUR NUMÉRIQUE DU BAC
    await bac.update({ tauxRemplissage: niveauNumerique });

    // CRÉATION NUMÉRIQUE DANS L'HISTORIQUE
    const nouveauRemplissage = await Remplissage.create({
      idDispositif: dispositif.id,
      idBac: bac.id,
      distanceCm: distance,
      batterie: batterie !== undefined ? Number(batterie) : null,
      niveauPourcent: niveauNumerique,
      dateMesure: new Date(),
    });

    // --- LOGIQUE D'ALERTE ---
    const seuilAlerte = 80;
    if (niveauNumerique >= seuilAlerte) {
      await Alerte.create({
        idBac: bac.id,
        type: 'bac_plein',
        niveauUrgence: niveauNumerique >= 95 ? 'eleve' : 'moyen',
        statut: 'OUVERTE',
        message: `Bac ${bac.id} presque plein : ${niveauNumerique}%`,
        date: new Date()
      });
    }

    return res.status(200).json({ 
      message: `Mise à jour réussie : ${niveauNumerique}%`, 
      data: nouveauRemplissage 
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour IoT', error: error.message });
  }
};

// --- 4. SUPPRIMER (DELETE /api/remplissages/:id) ---
exports.delete = async (req, res) => {
  try {
    const deleted = await Remplissage.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Enregistrement non trouvé' });
    return res.status(200).json({ message: 'Enregistrement supprimé avec succès' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

// --- 5. MODIFICATION MANUELLE (PUT /api/remplissages/:id) ---
exports.updateManual = async (req, res) => {
  try {
    const { distance_cm, batterie, niveauPourcent } = req.body;
    const item = await Remplissage.findByPk(req.params.id);
    
    if (!item) return res.status(404).json({ message: 'Enregistrement introuvable' });

    await item.update({
      distanceCm: distance_cm !== undefined ? Number(distance_cm) : item.distanceCm,
      batterie: batterie !== undefined ? Number(batterie) : item.batterie,
      niveauPourcent: niveauPourcent !== undefined ? Number(niveauPourcent) : item.niveauPourcent
    });

    return res.status(200).json({ message: 'Mis à jour avec succès', data: item });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la mise à jour manuelle', error: error.message });
  }
};