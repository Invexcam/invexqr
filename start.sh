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
        echo "📥 Installing dependencies..."
        npm ci --production
    fi
    
    # Build the application if dist doesn't exist
    if [ ! -d "dist" ]; then
        echo "🔨 Building application..."
        npm run build
    fi
    
    # Run database migrations
    echo "🗄️ Running database migrations..."
    npm run db:push
    
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
    
    # Run database migrations
    echo "🗄️ Running database migrations..."
    npm run db:push
    
    # Start development server
    echo "✅ Starting development server..."
    exec npm run dev
fi