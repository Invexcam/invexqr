#!/bin/bash

# InvexQR Database Setup Script
# Automatically sets up PostgreSQL database for InvexQR

set -e

echo "🗄️ Setting up PostgreSQL database for InvexQR..."

# Function to generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "📦 Using Docker for database setup..."
    
    # Generate secure password
    DB_PASSWORD=$(generate_password)
    
    # Create .env.db file
    cat > .env.db << EOF
POSTGRES_DB=invexqr
POSTGRES_USER=invexqr_user
POSTGRES_PASSWORD=invexqr2025q
EOF
    
    # Start PostgreSQL container
    docker-compose -f docker-compose.db.yml --env-file .env.db up -d
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    
    # Test connection
    until docker exec invexqr-postgres pg_isready -U invexqr_user -d invexqr; do
        echo "Waiting for database..."
        sleep 2
    done
    
    # Database URL for your application
    DATABASE_URL="postgresql://invexqr_user:invexqr2025q@invexqr-postgres:5432/invexqr"
    
    echo "✅ Database setup complete!"
    echo ""
    echo "📋 Database Information:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: invexqr"
    echo "   Username: invexqr_user"
    echo "   Password: invexqr2025q"
    echo ""
    echo "🔗 DATABASE_URL:"
    echo "   $DATABASE_URL"
    echo ""
    echo "💾 Add this to your .env.production file:"
    echo "DATABASE_URL=\"$DATABASE_URL\""
    
elif command -v psql &> /dev/null; then
    echo "🐘 Using local PostgreSQL installation..."
    
    # Generate secure password
    DB_PASSWORD=invexqr2025q
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE DATABASE invexqr;
CREATE USER invexqr_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE invexqr TO invexqr_user;
ALTER USER invexqr_user CREATEDB;
\q
EOF
    
    DATABASE_URL="postgresql://invexqr_user:invexqr2025q@invexqr-postgres:5432/invexqr"
    
    echo "✅ Database setup complete!"
    echo ""
    echo "🔗 DATABASE_URL:"
    echo "   $DATABASE_URL"
    echo ""
    echo "💾 Add this to your .env.production file:"
    echo "DATABASE_URL=\"$DATABASE_URL\""
    
else
    echo "❌ Neither Docker nor PostgreSQL found."
    echo ""
    echo "Please choose one of these options:"
    echo ""
    echo "🌐 CLOUD DATABASES (Recommended):"
    echo "   1. Neon (Free): https://neon.tech"
    echo "   2. Supabase (Free): https://supabase.com"
    echo "   3. Railway (Paid): https://railway.app"
    echo ""
    echo "🖥️ LOCAL INSTALLATION:"
    echo "   Ubuntu/Debian: sudo apt install postgresql"
    echo "   CentOS/RHEL: sudo yum install postgresql-server"
    echo "   macOS: brew install postgresql"
    echo ""
    echo "🐳 DOCKER INSTALLATION:"
    echo "   curl -fsSL https://get.docker.com | sh"
    echo "   sudo usermod -aG docker \$USER"
    echo ""
    exit 1
fi

# Create or update .env.production
if [ -f .env.production ]; then
    # Update existing file
    if grep -q "DATABASE_URL=" .env.production; then
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" .env.production
    else
        echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env.production
    fi
else
    # Create new file
    cat > .env.production << EOF
# InvexQR Production Environment
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL="$DATABASE_URL"

# Firebase
VITE_FIREBASE_API_KEY=AIzaSyAEdlkepge2d3SnlLrpEoJkqv8PAjISfVA
VITE_FIREBASE_APP_ID=invextrack-a1001
VITE_FIREBASE_PROJECT_ID=1:746716963518:web:0faf49c4b09299ba2a74ef

# Auth / Session
SESSION_SECRET=I$yXqM7ZfR3!Tq1cWopE8Azz0m2YBkPv

# PayPal
PAYPAL_CLIENT_ID=AXu-EpJWDQ7Bl7Z_rQ6llW8QokphIfWfBPeyfv1aHbqQl8wGS5Ak_l6P0YCJtp3r2BYlQn6-zP_MjG7v
PAYPAL_CLIENT_SECRET=sk_9a8s7df98a7sdf98a7sd9f8a7sd9f87a
EOF
fi

echo ""
echo "📝 Next steps:"
echo "   1. Edit .env.production with your Firebase configuration"
echo "   2. Run: ./deploy-vps.sh (for Docker deployment)"
echo "   3. Or run: ./start.sh (for direct deployment)"
