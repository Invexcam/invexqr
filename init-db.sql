-- InvexQR Database Initialization
-- This script sets up the initial database structure

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE invexqr TO invexqr_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO invexqr_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO invexqr_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO invexqr_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO invexqr_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO invexqr_user;