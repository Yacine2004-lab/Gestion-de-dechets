-- =============================================================================
-- Migration : table public.dispositifs_iot
--
-- 1) typeCapteur : passage à l'enum Sequelize ('ultrason', 'ESP-32')
--    (remplace les anciennes valeurs typiques : ESP32, autres, etc.)
-- 2) idSerie : alignement sur le format API IOT-00001 (lignes NULL ou ESP-*)
--
-- Sequelize nomme le type enum : enum_<tableName>_<fieldName>
-- Ici : enum_dispositifs_iot_typeCapteur
--
-- Avant d'exécuter : sauvegarde de la base (pg_dump).
--
-- Exemple :
--   psql -h localhost -U postgres -d gestion_dechets -f migrations/20250403_dispositifs_iot_enum_idserie.sql
-- (adapter -d au nom dans backend/.env, ex. DB_NAME)
--
-- Vérifications (optionnel, à lancer seul) :
--   SELECT column_name, udt_name, data_type
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'dispositifs_iot'
--   ORDER BY ordinal_position;
--
--   SELECT typname FROM pg_type WHERE typname LIKE 'enum%dispositif%';
-- =============================================================================

BEGIN;

-- Si une exécution précédente a échoué après CREATE TYPE :
-- DROP TYPE IF EXISTS enum_dispositifs_iot_typecapteur__migration_new CASCADE;

CREATE TYPE enum_dispositifs_iot_typecapteur__migration_new AS ENUM ('ultrason', 'ESP-32');

-- Colonne temporaire (Sequelize : "typeCapteur" entre guillemets)
ALTER TABLE public.dispositifs_iot
  ADD COLUMN "typeCapteur__migration_new" enum_dispositifs_iot_typecapteur__migration_new;

-- Copie des valeurs : ancien enum ou texte castable en texte
UPDATE public.dispositifs_iot
SET "typeCapteur__migration_new" = CASE
  WHEN trim("typeCapteur"::text) ILIKE 'ultrason' THEN 'ultrason'::enum_dispositifs_iot_typecapteur__migration_new
  WHEN trim("typeCapteur"::text) IN ('ESP32', 'ESP-32', 'esp32') THEN 'ESP-32'::enum_dispositifs_iot_typecapteur__migration_new
  -- 'autres' ou inconnu : à ajuster manuellement si besoin (ici : ultrason par défaut)
  ELSE 'ultrason'::enum_dispositifs_iot_typecapteur__migration_new
END
WHERE "typeCapteur__migration_new" IS NULL;

ALTER TABLE public.dispositifs_iot
  ALTER COLUMN "typeCapteur__migration_new" SET NOT NULL;

-- Ancienne colonne + ancien type enum Sequelize
ALTER TABLE public.dispositifs_iot DROP COLUMN "typeCapteur";

-- Type libéré : on renomme le nouveau pour retrouver le nom attendu par Sequelize
-- (Sequelize peut avoir créé le type avec ou sans casse ; les deux DROP couvrent l’habituel)
DROP TYPE IF EXISTS "enum_dispositifs_iot_typeCapteur";
DROP TYPE IF EXISTS enum_dispositifs_iot_typecapteur;

ALTER TYPE enum_dispositifs_iot_typecapteur__migration_new RENAME TO "enum_dispositifs_iot_typeCapteur";

ALTER TABLE public.dispositifs_iot
  RENAME COLUMN "typeCapteur__migration_new" TO "typeCapteur";

-- idSerie : même logique que l’API (IOT- + id sur 5 chiffres)
UPDATE public.dispositifs_iot
SET "idSerie" = 'IOT-' || lpad(id::text, 5, '0')
WHERE "idSerie" IS NULL
   OR trim("idSerie") ~* '^ESP[-_]';

COMMIT;

-- =============================================================================
-- Si la colonne s’appelle typecapteur (tout minuscule, sans guillemets Sequelize),
-- adaptez les identifiants "typeCapteur" dans ce script ou recréez la table en dev.
--
-- Ré-exécution : ce script n’est pas idempotent. En cas d’échec, restaurer la sauvegarde
-- ou supprimer manuellement la colonne "typeCapteur__migration_new" et le type
-- enum_dispositifs_iot_typecapteur__migration_new avant de relancer.
-- =============================================================================
