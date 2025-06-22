#!/bin/bash

# Production deployment script that handles drizzle-kit dependency issues
# This script ensures all dependencies are available for migrations

set -e

echo "🚀 InvexQR Production Deployment"

# Check for required environment file
if [ ! -f .env.production ]; then
    echo "❌ .env.production file required"
    echo "Run ./setup-database.sh first"
    exit 1
fi

# Install all dependencies (including dev dependencies for drizzle-kit)
echo "📦 Installing all dependencies..."
npm ci

# Run migrations using drizzle-kit
echo "🗄️ Running database migrations..."
npx drizzle-kit push

# Build the application
echo "🔨 Building application..."
npm run build

# Start production server
echo "✅ Starting production server..."
NODE_ENV=production node dist/index.js