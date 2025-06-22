# InvexQR Deployment Guide

## Quick Start Deployment

InvexQR can be deployed in multiple ways. Choose the method that best fits your infrastructure:

### 🐳 Docker Deployment (Recommended)

**One-command deployment:**
```bash
./deploy-vps.sh
```

This script automatically:
- Installs Docker and Docker Compose if needed
- Creates production environment configuration
- Builds and deploys the application
- Sets up health checks and monitoring

### 🔧 Direct VPS Deployment

**For direct server deployment:**
```bash
./start.sh
```

The start script automatically:
- Detects environment (development/production)
- Installs dependencies
- Builds the application
- Runs database migrations
- Starts the appropriate server

### ⚙️ System Service (Auto-start on boot)

**For production servers with automatic startup:**
```bash
sudo ./systemd-service.sh
```

This creates a systemd service that:
- Starts automatically on server boot
- Monitors and restarts the application if it crashes
- Manages logging and security
- Provides easy service management commands

## Environment Configuration

### Required Environment Variables

Create `.env.production` file:

```env
# Application
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Firebase Authentication
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id

# Session Security
SESSION_SECRET=your_secure_random_string

# PayPal (Optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication with Email/Password
3. Add your domain to authorized domains
4. Copy the configuration values to your environment file

### Database Setup

InvexQR supports PostgreSQL. The application automatically runs migrations on startup.

## Deployment Methods Comparison

| Method | Use Case | Auto-start | Monitoring | Ease of Use |
|--------|----------|------------|------------|-------------|
| Docker | Production, scalable | ✅ | ✅ | ⭐⭐⭐ |
| Direct | Development, testing | ❌ | ❌ | ⭐⭐⭐⭐⭐ |
| SystemD | Production servers | ✅ | ✅ | ⭐⭐⭐⭐ |

## Health Monitoring

All deployment methods include health checks at:
- HTTP: `http://your-server:5000/api/health`
- Returns: `{"status":"healthy","timestamp":"..."}`

## Management Commands

### Docker Deployment
```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart application
docker-compose -f docker-compose.production.yml restart

# Stop application
docker-compose -f docker-compose.production.yml down

# Update application
git pull && ./deploy-vps.sh
```

### SystemD Service
```bash
# View status
systemctl status invexqr

# Start/Stop/Restart
systemctl start invexqr
systemctl stop invexqr
systemctl restart invexqr

# View logs
journalctl -u invexqr -f
```

## Security Considerations

- Application runs as non-root user
- Environment variables are isolated
- Health checks prevent unresponsive deployments
- Automatic restart on failures
- TLS termination should be handled by reverse proxy (nginx/traefik)

## Troubleshooting

### Application Won't Start
1. Check environment variables are set correctly
2. Verify database connectivity
3. Check logs for specific error messages

### Database Connection Issues
1. Verify DATABASE_URL format
2. Check network connectivity to database
3. Ensure database exists and migrations can run

### Firebase Authentication Issues
1. Verify Firebase configuration values
2. Check authorized domains in Firebase console
3. Ensure Firebase project has authentication enabled

## Scaling and Production

For production deployments:
1. Use a reverse proxy (nginx) for SSL termination
2. Set up database backups
3. Monitor application logs
4. Configure log rotation
5. Set up monitoring and alerts

## Support

For deployment issues, check the logs first:
- Docker: `docker-compose logs`
- SystemD: `journalctl -u invexqr`
- Direct: Application console output