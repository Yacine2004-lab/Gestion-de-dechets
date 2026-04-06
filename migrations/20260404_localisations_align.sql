-- Erreur PostgreSQL 42703 sur INSERT localisations
-- Le modèle Sequelize utilise underscored: true → colonnes : quartier, id_zone_risque, created_at, updated_at, etc.
--
-- Étape 1 — lancer ceci (colonne souvent absente après changements du modèle) :
ALTER TABLE localisations ADD COLUMN IF NOT EXISTS quartier VARCHAR(255);

-- Étape 2 — si l’erreur continue, liste les colonnes :
--   SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'localisations';
--
-- Si tu vois "idZoneRisque" / "createdAt" (camelCase) au lieu de id_zone_risque / created_at :
--   retire underscored: true dans models/Localisation.js (bloc options du define),
--   OU renomme en base :
-- ALTER TABLE localisations RENAME COLUMN "idZoneRisque" TO id_zone_risque;
-- ALTER TABLE localisations RENAME COLUMN "createdAt" TO created_at;
-- ALTER TABLE localisations RENAME COLUMN "updatedAt" TO updated_at;
