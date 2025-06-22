#!/bin/bash

# InvexQR SystemD Service Setup Script
# This creates a systemd service for automatic startup on VPS boot

set -e

SERVICE_NAME="invexqr"
SERVICE_USER="invexqr"
APP_DIR="/opt/invexqr"

echo "🔧 Setting up InvexQR as a system service..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

# Create service user if it doesn't exist
if ! id "$SERVICE_USER" &>/dev/null; then
    echo "👤 Creating service user: $SERVICE_USER"
    useradd --system --home-dir "$APP_DIR" --shell /bin/bash "$SERVICE_USER"
fi

# Create application directory
echo "📁 Creating application directory: $APP_DIR"
mkdir -p "$APP_DIR"

# Copy application files (assuming current directory contains the app)
echo "📦 Copying application files..."
cp -r . "$APP_DIR/"
chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Create systemd service file
echo "⚙️ Creating systemd service file..."
cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=InvexQR - Dynamic QR Code Generator
Documentation=https://github.com/your-repo/invexqr
After=network.target
Wants=network.target

[Service]
Type=exec
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/start.sh
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR
PrivateTmp=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

# Environment
Environment=NODE_ENV=production
Environment=PORT=5000
Environment=HOST=0.0.0.0
EnvironmentFile=-$APP_DIR/.env.production

[Install]
WantedBy=multi-user.target
EOF

# Install dependencies and build application
echo "🔨 Installing dependencies and building application..."
cd "$APP_DIR"
sudo -u "$SERVICE_USER" npm ci --production
sudo -u "$SERVICE_USER" npm run build

# Reload systemd and enable service
echo "🔄 Enabling and starting service..."
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# Wait for service to start
sleep 5

# Check service status
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ InvexQR service is running successfully!"
    echo ""
    echo "📋 Service management commands:"
    echo "   Status:  systemctl status $SERVICE_NAME"
    echo "   Start:   systemctl start $SERVICE_NAME"
    echo "   Stop:    systemctl stop $SERVICE_NAME"
    echo "   Restart: systemctl restart $SERVICE_NAME"
    echo "   Logs:    journalctl -u $SERVICE_NAME -f"
    echo ""
    echo "🌐 Application should be accessible at: http://$(curl -s ifconfig.me):5000"
else
    echo "❌ Service failed to start. Check logs with:"
    echo "   journalctl -u $SERVICE_NAME -n 50"
    exit 1
fi