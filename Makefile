# InvexQR Makefile - Simplified deployment commands

.PHONY: help setup deploy start stop logs clean build test

# Default target
help:
	@echo "InvexQR Deployment Commands"
	@echo "=========================="
	@echo "make setup    - Setup database and environment"
	@echo "make deploy   - Deploy with Docker (recommended)"
	@echo "make start    - Start application directly"
	@echo "make stop     - Stop Docker containers"
	@echo "make logs     - View application logs"
	@echo "make build    - Build application"
	@echo "make clean    - Clean containers and images"
	@echo "make test     - Test application health"

# Setup database and environment
setup:
	@echo "Setting up database and environment..."
	@chmod +x setup-database.sh
	@./setup-database.sh

# Deploy with Docker
deploy:
	@echo "Deploying InvexQR with Docker..."
	@chmod +x deploy-vps.sh
	@./deploy-vps.sh

# Start application directly
start:
	@echo "Starting InvexQR application..."
	@chmod +x start.sh
	@./start.sh

# Stop Docker containers
stop:
	@echo "Stopping InvexQR containers..."
	@docker-compose -f docker-compose.production.yml down

# View logs
logs:
	@echo "Viewing application logs..."
	@docker-compose -f docker-compose.production.yml logs -f

# Build application
build:
	@echo "Building InvexQR..."
	@npm run build

# Clean Docker resources
clean:
	@echo "Cleaning Docker resources..."
	@docker-compose -f docker-compose.production.yml down --volumes --remove-orphans
	@docker system prune -f

# Test application health
test:
	@echo "Testing application health..."
	@curl -f http://localhost:5000/api/health || echo "Application not responding"

# Install dependencies
install:
	@echo "Installing dependencies..."
	@npm ci

# Database operations
db-setup:
	@echo "Setting up database..."
	@./setup-database.sh

db-migrate:
	@echo "Running database migrations..."
	@npm run db:push

# Development commands
dev:
	@echo "Starting development server..."
	@npm run dev

# Production build and start
production: build
	@echo "Starting production server..."
	@NODE_ENV=production npm start

# Quick deployment (setup + deploy)
quick: setup deploy

# System service setup
service:
	@echo "Setting up system service..."
	@chmod +x systemd-service.sh
	@sudo ./systemd-service.sh