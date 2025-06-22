#!/bin/bash

# InvexQR Quick Deploy - One-command deployment for any environment
# Usage: ./quick-deploy.sh [docker|systemd|direct]

set -e

DEPLOY_TYPE=${1:-docker}

echo "🚀 InvexQR Quick Deploy - Mode: $DEPLOY_TYPE"

case $DEPLOY_TYPE in
    "docker")
        echo "Starting Docker deployment..."
        ./deploy-vps.sh
        ;;
    "systemd")
        echo "Starting SystemD service setup..."
        sudo ./systemd-service.sh
        ;;
    "direct")
        echo "Starting direct deployment..."
        chmod +x start.sh
        ./start.sh
        ;;
    *)
        echo "Usage: ./quick-deploy.sh [docker|systemd|direct]"
        echo ""
        echo "Available deployment modes:"
        echo "  docker   - Docker container deployment (recommended)"
        echo "  systemd  - System service with auto-restart"
        echo "  direct   - Direct execution"
        exit 1
        ;;
esac