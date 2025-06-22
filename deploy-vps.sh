#!/bin/bash

# InvexQR VPS Deployment Script
# Usage: ./deploy-vps.sh

set -e

echo "🚀 InvexQR VPS Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_status "Docker installed. Please logout and login again, then re-run this script."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
fi

# Create environment file if it doesn't exist
if [ ! -f .env.production ]; then
    print_warning "Creating .env.production file..."
    cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=your_database_url_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id

# Session Secret (generate a secure random string)
SESSION_SECRET=your_secure_session_secret_here

# PayPal Configuration (optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
EOF
    print_warning "Please edit .env.production with your actual configuration values"
    print_warning "Then run this script again"
    exit 1
fi

# Source the environment file
set -a
source .env.production
set +a

# Validate required environment variables
required_vars=("DATABASE_URL" "VITE_FIREBASE_API_KEY" "VITE_FIREBASE_APP_ID" "VITE_FIREBASE_PROJECT_ID")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "your_${var,,}_here" ]; then
        print_error "Please set $var in .env.production"
        exit 1
    fi
done

print_status "Environment variables validated"

# Stop and remove existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.production.yml down --remove-orphans

# Build and start the application
print_status "Building and starting InvexQR..."
docker-compose -f docker-compose.production.yml up -d --build

# Wait for application to be healthy
print_status "Waiting for application to be ready..."
sleep 30

# Check if application is running
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_status "InvexQR is running successfully!"
    print_status "Application URL: http://$(curl -s ifconfig.me):5000"
    print_status "Health check: http://$(curl -s ifconfig.me):5000/api/health"
else
    print_error "Application failed to start properly"
    print_warning "Checking logs..."
    docker-compose -f docker-compose.production.yml logs --tail=50
    exit 1
fi

# Show useful commands
echo ""
echo "📋 Useful commands:"
echo "   View logs:        docker-compose -f docker-compose.production.yml logs -f"
echo "   Stop application: docker-compose -f docker-compose.production.yml down"
echo "   Restart:          docker-compose -f docker-compose.production.yml restart"
echo "   Update:           git pull && ./deploy-vps.sh"
echo ""
print_status "Deployment completed successfully!"