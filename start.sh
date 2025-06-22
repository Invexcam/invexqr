#!/bin/bash

# InvexQR - Auto-start script for VPS/Docker deployment
# This script automatically sets up and runs the application

set -e

echo "🚀 Starting InvexQR Application..."

# Check if we're in production mode
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Production mode detected"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing production dependencies..."
        npm ci --production
        echo "📥 Installing drizzle-kit for migrations..."
        npm install drizzle-kit --no-save
    fi
    
    # Build the application if dist doesn't exist
    if [ ! -d "dist" ]; then
        echo "🔨 Building application..."
        npm run build
    fi
    
    # Run database migrations with fallback
    echo "🗄️ Running database migrations..."
    if [ -f "migrate.js" ]; then
        node migrate.js || echo "⚠️ Migration failed, continuing with existing schema..."
    elif [ -f "node_modules/.bin/drizzle-kit" ]; then
        ./node_modules/.bin/drizzle-kit push || echo "⚠️ Migration failed, continuing with existing schema..."
    elif command -v npx &> /dev/null; then
        npx drizzle-kit push || echo "⚠️ Migration failed, continuing with existing schema..."
    else
        echo "⚠️ Skipping migrations - migration tools not available"
    fi
    
    # Start the application
    echo "✅ Starting production server..."
    exec node dist/index.js
else
    echo "🔧 Development mode detected"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies..."
        npm install
    fi
    
    # Run database migrations with fallback
    echo "🗄️ Running database migrations..."
    if [ -f "migrate.js" ]; then
        node migrate.js || echo "⚠️ Migration failed, continuing with existing schema..."
    elif [ -f "node_modules/.bin/drizzle-kit" ]; then
        ./node_modules/.bin/drizzle-kit push || echo "⚠️ Migration failed, continuing with existing schema..."
    elif command -v npx &> /dev/null; then
        npx drizzle-kit push || echo "⚠️ Migration failed, continuing with existing schema..."
    else
        echo "⚠️ Skipping migrations - migration tools not available"
    fi
    
    # Start development server
    echo "✅ Starting development server..."
    exec npm run dev
fi