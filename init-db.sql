-- InvexQR Database Initialization
-- Ce script crée utilisateur, base, extensions et permissions

-- Créer l'utilisateur si n'existe pas (PostgreSQL 9.6+)
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'invexqr_user'
   ) THEN
      CREATE ROLE invexqr_user LOGIN PASSWORD 'invexqr2025q';
   ELSE
      ALTER ROLE invexqr_user WITH LOGIN PASSWORD 'invexqr2025q';
   END IF;
END
$$;

-- Créer la base si elle n'existe pas
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'invexqr'
   ) THEN
      CREATE DATABASE invexqr OWNER invexqr_user;
   END IF;
END
$$;

-- Connexion à la base pour suite des commandes
\connect invexqr

-- Activer l'extension uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accorder les permissions nécessaires
GRANT ALL PRIVILEGES ON DATABASE invexqr TO invexqr_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO invexqr_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO invexqr_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO invexqr_user;

-- Défaut des permissions pour les futurs objets
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO invexqr_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO invexqr_user;
