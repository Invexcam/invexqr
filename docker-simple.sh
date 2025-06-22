#!/bin/bash

# Simple Docker deployment without docker-compose
# For systems where docker-compose might have issues

set -e

echo "🐳 InvexQR Simple Docker Deployment"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found"
    echo "Run ./setup-database.sh first to create environment configuration"
    exit 1
fi

# Source environment variables
set -a
source .env.production
set +a

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t invexqr:latest -f Dockerfile --target production .

# Stop and remove existing container if it exists
echo "🛑 Stopping existing container..."
docker stop invexqr-app 2>/dev/null || true
docker rm invexqr-app 2>/dev/null || true

# Run the container
echo "🚀 Starting InvexQR container..."
docker run -d \
    --name invexqr-app \
    --restart unless-stopped \
    -p 5000:5000 \
    -e NODE_ENV=production \
    -e PORT=5000 \
    -e HOST=0.0.0.0 \
    -e DATABASE_URL="$DATABASE_URL" \
    -e VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
    -e VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
    -e VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
    -e SESSION_SECRET="$SESSION_SECRET" \
    -e PAYPAL_CLIENT_ID="${PAYPAL_CLIENT_ID:-}" \
    -e PAYPAL_CLIENT_SECRET="${PAYPAL_CLIENT_SECRET:-}" \
    invexqr:latest

# Wait for container to start
echo "⏳ Waiting for application to start..."
sleep 15

# Check if application is running
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ InvexQR is running successfully!"
    echo "🌐 Application URL: http://localhost:5000"
    echo ""
    echo "📋 Management commands:"
    echo "   View logs:    docker logs -f invexqr-app"
    echo "   Stop:         docker stop invexqr-app"
    echo "   Restart:      docker restart invexqr-app"
    echo "   Remove:       docker stop invexqr-app && docker rm invexqr-app"
else
    echo "❌ Application failed to start"
    echo "📋 Check logs: docker logs invexqr-app"
    exit 1
fi