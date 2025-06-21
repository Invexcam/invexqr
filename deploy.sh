#!/bin/bash

# InvexQR Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: production, staging

set -e

ENVIRONMENT=${1:-production}
APP_NAME="invexqr"
DOCKER_IMAGE="$APP_NAME:latest"

echo "🚀 Deploying InvexQR to $ENVIRONMENT environment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Validate required environment variables
required_vars=("DATABASE_URL" "SESSION_SECRET" "REPL_ID")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set."
        exit 1
    fi
done

# Create necessary directories
mkdir -p logs ssl

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down || true

# Build new image
echo "🔨 Building Docker image..."
docker build -t $DOCKER_IMAGE .

# Start services
echo "🎯 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🔍 Performing health check..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Application is healthy and running!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Health check failed after $max_attempts attempts"
        echo "📋 Container logs:"
        docker-compose logs app
        exit 1
    fi
    
    echo "🔄 Attempt $attempt/$max_attempts - waiting for application to start..."
    sleep 5
    ((attempt++))
done

# Display running services
echo "📊 Running services:"
docker-compose ps

# Display access information
echo ""
echo "🎉 Deployment completed successfully!"
echo "📍 Application URLs:"
echo "   - Local: http://localhost:3001"
echo "   - Server: http://207.180.239.163:3001"
if [ -n "$DOMAIN" ]; then
    echo "   - Domain: https://$DOMAIN"
fi
echo ""
echo "📝 To view logs: docker-compose logs -f app"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"