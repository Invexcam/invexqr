# InvexQR - Dynamic QR Code Generator

A comprehensive multi-tenant SaaS platform for creating and managing dynamic QR codes with advanced real-time analytics.

## Quick Start

### 1. Database Setup
```bash
# Automatic database setup
./setup-database.sh
```

### 2. Deploy Application
```bash
# One-command deployment (Docker recommended)
./deploy-vps.sh

# Or direct deployment
./start.sh

# Or system service
sudo ./systemd-service.sh
```

## Configuration

### Required Environment Variables

Create `.env.production`:

```env
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
```

### Database Options

**Cloud Databases (Recommended):**
- [Neon](https://neon.tech) - Free PostgreSQL
- [Supabase](https://supabase.com) - Free with additional features
- [Railway](https://railway.app) - Paid hosting

**Self-hosted:**
```bash
# Setup included PostgreSQL with Docker
./setup-database.sh
```

## Features

- Dynamic QR code generation and management
- Real-time analytics and tracking
- Multi-content type support (URL, WiFi, vCard, SMS, Email)
- Custom styling and branding
- PayPal subscription integration ($5/month)
- Multi-language support
- Export functionality (PNG, SVG, PDF)
- Device and location tracking
- Email notifications

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Firebase Auth
- **Payments:** PayPal integration
- **Deployment:** Docker, SystemD service

## Deployment Methods

| Method | Command | Use Case | Auto-restart |
|--------|---------|----------|--------------|
| Docker | `./deploy-vps.sh` | Production, scalable | ✅ |
| SystemD | `sudo ./systemd-service.sh` | VPS with auto-start | ✅ |
| Direct | `./start.sh` | Development, testing | ❌ |

## Management

### Docker Commands
```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart
docker-compose -f docker-compose.production.yml restart

# Update
git pull && ./deploy-vps.sh
```

### SystemD Commands
```bash
# Status
systemctl status invexqr

# Restart
systemctl restart invexqr

# Logs
journalctl -u invexqr -f
```

## Health Monitoring

Application health check available at:
```
http://your-server:5000/api/health
```

## Support

- Check logs for troubleshooting
- Verify environment variables
- Ensure database connectivity
- Confirm Firebase configuration

## License

MIT License