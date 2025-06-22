#!/usr/bin/env node

// Standalone migration script for production deployments
// This handles database schema creation without requiring drizzle-kit

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool });

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Create sessions table for Replit Auth
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" varchar PRIMARY KEY NOT NULL,
        "sess" jsonb NOT NULL,
        "expire" timestamp NOT NULL
      );
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
    `);

    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar UNIQUE,
        "first_name" varchar,
        "last_name" varchar,
        "profile_image_url" varchar,
        "subscription_id" varchar,
        "subscription_status" varchar DEFAULT 'FREE',
        "subscription_plan_id" varchar,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    // Create qr_codes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "qr_codes" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" varchar NOT NULL,
        "name" varchar NOT NULL,
        "original_url" varchar NOT NULL,
        "short_code" varchar NOT NULL UNIQUE,
        "type" varchar NOT NULL,
        "content_type" varchar NOT NULL,
        "content" jsonb,
        "style" jsonb,
        "customization" jsonb,
        "description" varchar,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "qr_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
      );
    `);

    // Create qr_scans table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "qr_scans" (
        "id" serial PRIMARY KEY NOT NULL,
        "qr_code_id" integer NOT NULL,
        "scanned_at" timestamp DEFAULT now(),
        "ip_address" varchar,
        "user_agent" varchar,
        "device_type" varchar,
        "country" varchar,
        "city" varchar,
        CONSTRAINT "qr_scans_qr_code_id_qr_codes_id_fk" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE cascade
      );
    `);

    console.log('✅ Database migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();