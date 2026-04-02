const { Sequelize } = require('sequelize');
const { DispositifIoT, Bac, Remplissage, Alerte } = require('../models');

/** Clé de comparaison : casse ignorée, underscore et tiret équivalents (ESP_006 ≈ ESP-006). */
function idSerieCompareKey(s) {
  return String(s).trim().toLowerCase().replace(/_/g, '-');
}

// POST /api/iot/update
// Body: { id_serie, distance_cm, batterie }
exports.update = async (req, res) => {
  try {
    const idSerieBody = req.body.id_serie ?? req.body.idSerie;
    const { distance_cm, batterie } = req.body;

    if (!idSerieBody || distance_cm === undefined) {
      return res.status(400).json({
        message: 'id_serie (ou idSerie) et distance_cm sont obligatoires',
      });
    }

    const idSerieNorm = String(idSerieBody).trim();
    const dispositif = await DispositifIoT.findOne({
      where: Sequelize.where(
        Sequelize.fn(
          'LOWER',
          Sequelize.fn('REPLACE', Sequelize.col('DispositifIoT.idSerie'), '_', '-')
        ),
        idSerieCompareKey(idSerieNorm)
      ),
    });
    if (!dispositif) {
      let idSeriesEnBase = [];
      if (process.env.NODE_ENV !== 'production') {
        const rows = await DispositifIoT.findAll({
          attributes: ['idSerie'],
          limit: 30,
          raw: true,
        });
        idSeriesEnBase = rows
          .map((r) => r.idSerie ?? r.idserie)
          .filter((v) => v != null && String(v).trim() !== '');
      }
      return res.status(404).json({
        message: 'Dispositif introuvable : aucun enregistrement avec cet idSerie dans dispositifs_iot',
        idSerieDemande: idSerieNorm,
        hint:
          'Même base que DB_NAME dans .env. Vérifiez tiret vs underscore (ESP-006 vs ESP_006 sont acceptés de la même façon après redémarrage). En admin : GET /api/dispositifs-iot. Sinon créez un bac puis POST /api/dispositifs-iot avec idSerie + idBac.',
        ...(idSeriesEnBase.length ? { idSeriesEnBase } : {}),
      });
    }

    const bac = await Bac.findByPk(dispositif.idBac);
    if (!bac) return res.status(404).json({ message: 'Bac lié au dispositif introuvable' });

    // Hypothèse simple pour la simulation: hauteur max = 100 cm
    const hauteurMaxCm = 100;
    const distance = Number(distance_cm);
    let niveau = ((hauteurMaxCm - distance) / hauteurMaxCm) * 100;
    if (Number.isNaN(niveau)) niveau = 0;
    niveau = Math.max(0, Math.min(100, niveau));

    await dispositif.update({
      niveauMesure: `${niveau.toFixed(2)}%`,
      batterie: batterie !== undefined ? Number(batterie) : dispositif.batterie,
    });

    await bac.update({ tauxRemplissage: Number(niveau.toFixed(2)) });

    await Remplissage.create({
      idDispositif: dispositif.id,
      idBac: bac.id,
      distanceCm: distance,
      batterie: batterie !== undefined ? Number(batterie) : null,
      niveauPourcent: Number(niveau.toFixed(2)),
      dateMesure: new Date(),
    });

    // Alertes : uniquement via les mesures IoT (pas de POST /api/alertes)
    const seuilAlerte = Number(process.env.ALERTE_SEUIL_PERCENT || 80);
    const alerteOuverte = await Alerte.findOne({
      where: { idBac: bac.id, type: 'bac_plein', statut: 'OUVERTE' },
      order: [['id', 'DESC']],
    });

    /** Résumé pour le client (Postman / tableau de bord) */
    let alerteAuto = {
      source: 'dispositif_iot',
      idDispositif: dispositif.id,
      idSerie: dispositif.idSerie,
      seuilPercent: seuilAlerte,
      action: 'aucune',
      idAlerte: null,
      statut: null,
    };

    if (niveau >= seuilAlerte) {
      if (!alerteOuverte) {
        const created = await Alerte.create({
          idBac: bac.id,
          type: 'bac_plein',
          niveauUrgence: niveau >= 95 ? 'eleve' : 'moyen',
          statut: 'OUVERTE',
          message: `Bac ${bac.id} — capteur ${dispositif.idSerie} : ${niveau.toFixed(2)}% (seuil ${seuilAlerte}%)`,
          date: new Date(),
        });
        alerteAuto = {
          ...alerteAuto,
          action: 'alerte_creee',
          idAlerte: created.id,
          statut: created.statut,
        };
      } else {
        await alerteOuverte.update({
          niveauUrgence: niveau >= 95 ? 'eleve' : 'moyen',
          message: `Bac ${bac.id} — capteur ${dispositif.idSerie} : ${niveau.toFixed(2)}% (seuil ${seuilAlerte}%)`,
          date: new Date(),
        });
        alerteAuto = {
          ...alerteAuto,
          action: 'alerte_mise_a_jour',
          idAlerte: alerteOuverte.id,
          statut: 'OUVERTE',
        };
      }
    } else if (alerteOuverte) {
      await alerteOuverte.update({
        statut: 'RESOLUE',
        message: `Alerte résolue — capteur ${dispositif.idSerie}, bac ${bac.id} à ${niveau.toFixed(2)}%`,
        date: new Date(),
      });
      alerteAuto = {
        ...alerteAuto,
        action: 'alerte_resolue',
        idAlerte: alerteOuverte.id,
        statut: 'RESOLUE',
      };
    }

    return res.status(200).json({
      message: `Mise à jour IoT reçue. Niveau de remplissage: ${niveau.toFixed(2)}%`,
      data: {
        id_serie: idSerieBody,
        idDispositif: dispositif.id,
        idBac: bac.id,
        distance_cm: distance,
        batterie: batterie !== undefined ? Number(batterie) : null,
        niveau: `${niveau.toFixed(2)}%`,
      },
      alerte: alerteAuto,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur IoT update', error });
  }
};

