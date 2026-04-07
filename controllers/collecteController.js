const { Collecte, Bac, Utilisateur, Alerte } = require('../models');
const { Op } = require('sequelize'); // Importation des opérateurs Sequelize

// 1. Utilitaire de formatage
function withBacTaux(item, bac) {
  const plain = item.get ? item.get({ plain: true }) : item;
  return {
    ...plain,
    tauxRemplissageBac: bac ? bac.tauxRemplissage : null,
  };
}

// 2. Liste des collectes
exports.list = async (req, res) => {
  try {
    const idFromToken = Number(req.auth?.idUtilisateur);
    const actor = await Utilisateur.findByPk(idFromToken);
    const condition = actor?.role === 'admin' ? {} : { idUtilisateur: idFromToken };

    const items = await Collecte.findAll({
      where: condition,
      include: [{ model: Bac, attributes: ['id', 'tauxRemplissage'] }],
      order: [['date', 'DESC']]
    });
    return res.status(200).json(items.map((it) => withBacTaux(it, it.Bac)));
  } catch (error) {
    return res.status(500).json({ message: 'Erreur liste', error: error.message });
  }
};

// 3. Détail d'une collecte
exports.getById = async (req, res) => {
  try {
    const item = await Collecte.findByPk(req.params.id, { include: [Bac] });
    if (!item) return res.status(404).json({ message: 'Introuvable' });
    return res.status(200).json(withBacTaux(item, item.Bac));
  } catch (error) {
    return res.status(500).json({ message: 'Erreur detail', error: error.message });
  }
};

// 4. Création
exports.create = async (req, res) => {
  try {
    const idFromToken = req.auth?.idUtilisateur;
    const item = await Collecte.create({ 
      ...req.body, 
      idUtilisateur: idFromToken, 
      statut: 'planifiée' 
    });
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur creation', error: error.message });
  }
};

// 5. ✅ VALIDATION (Mise à jour pour inclure OUVERTE et ACTIVE)
exports.validerCollecte = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Collecte.findByPk(id);
    if (!item) return res.status(404).json({ message: "Collecte introuvable" });

    // 1. Mettre à jour la collecte
    await item.update({ statut: 'terminée', dateFin: new Date() });

    // 2. Mettre à jour le Bac (Remise à zéro)
    const bac = await Bac.findByPk(item.idBac);
    if (bac) await bac.update({ tauxRemplissage: 0 });

    // 3. 🚀 RÉSOLUTION DE L'ALERTE 
    // On cherche l'alerte dont le statut est soit 'ACTIVE' soit 'OUVERTE'
    await Alerte.update(
      { 
        statut: 'RESOLUE', 
        message: "Collecte terminée avec succès - Bac vidé." 
      },
      { 
        where: { 
          idBac: item.idBac,
          statut: { [Op.or]: ['ACTIVE', 'OUVERTE'] } 
        } 
      }
    );

    return res.status(200).json({ message: "Succès", data: item });
  } catch (error) {
    return res.status(500).json({ message: "Erreur validation", error: error.message });
  }
};

// 6. Suppression
exports.remove = async (req, res) => {
  try {
    const item = await Collecte.findByPk(req.params.id);
    if (item) await item.destroy();
    return res.status(200).json({ message: 'Supprimé' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur suppression', error: error.message });
  }
};