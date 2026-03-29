-- RULES ISCA : interdire UPDATE et DELETE sur les tables signees
-- Article 286-I-3° bis du CGI — Condition d'Inalterabilite
--
-- ATTENTION : ces RULES font que Prisma.update() et Prisma.delete()
-- ne feront RIEN silencieusement sur ces tables. C'est voulu.
-- Toute correction se fait par un NOUVEAU enregistrement
-- (avoir, remboursement, nouvelle ligne JET).
--
-- A executer manuellement apres les migrations Prisma :
--   psql $DATABASE_URL -f prisma/migrations/isca-rules.sql

-- Table IscaCommande
CREATE OR REPLACE RULE isca_commande_no_update AS
  ON UPDATE TO "IscaCommande" DO INSTEAD NOTHING;
CREATE OR REPLACE RULE isca_commande_no_delete AS
  ON DELETE TO "IscaCommande" DO INSTEAD NOTHING;

-- Table IscaArticle
CREATE OR REPLACE RULE isca_article_no_update AS
  ON UPDATE TO "IscaArticle" DO INSTEAD NOTHING;
CREATE OR REPLACE RULE isca_article_no_delete AS
  ON DELETE TO "IscaArticle" DO INSTEAD NOTHING;

-- Table IscaPaiement
CREATE OR REPLACE RULE isca_paiement_no_update AS
  ON UPDATE TO "IscaPaiement" DO INSTEAD NOTHING;
CREATE OR REPLACE RULE isca_paiement_no_delete AS
  ON DELETE TO "IscaPaiement" DO INSTEAD NOTHING;

-- Table IscaFermeture
CREATE OR REPLACE RULE isca_fermeture_no_update AS
  ON UPDATE TO "IscaFermeture" DO INSTEAD NOTHING;
CREATE OR REPLACE RULE isca_fermeture_no_delete AS
  ON DELETE TO "IscaFermeture" DO INSTEAD NOTHING;

-- Table IscaTracabilite (JET)
CREATE OR REPLACE RULE isca_tracabilite_no_update AS
  ON UPDATE TO "IscaTracabilite" DO INSTEAD NOTHING;
CREATE OR REPLACE RULE isca_tracabilite_no_delete AS
  ON DELETE TO "IscaTracabilite" DO INSTEAD NOTHING;
