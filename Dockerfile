# Multi-stage build pour optimiser la taille de l'image
FROM node:20-alpine AS base

# Installer les dépendances système
RUN apk add --no-cache \
    curl \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration pour les dépendances
COPY package*.json ./

# Stage de développement
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Stage de build
FROM base AS builder

# Installer toutes les dépendances (dev + prod)
RUN npm ci

# Copier tout le code source
COPY . .

# Compiler TypeScript et construire l'application
RUN npm run build

# Stage de production
FROM node:20-alpine AS production

# Installer les dépendances système pour la production
RUN apk add --no-cache \
    curl \
    postgresql-client \
    dumb-init \
    bash \
    && rm -rf /var/cache/apk/*

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs \
    && adduser -S invexqr -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et installer uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier les fichiers compilés depuis le stage builder
COPY --from=builder --chown=invexqr:nodejs /app/dist ./dist
COPY --from=builder --chown=invexqr:nodejs /app/server ./server
COPY --from=builder --chown=invexqr:nodejs /app/shared ./shared
COPY --from=builder --chown=invexqr:nodejs /app/drizzle.config.ts ./

# Copier le script de démarrage
COPY --chown=invexqr:nodejs start.sh ./start.sh
RUN chmod +x start.sh

# Créer le répertoire des logs
RUN mkdir -p /app/logs && chown invexqr:nodejs /app/logs

# Changer vers l'utilisateur non-root
USER invexqr

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Utiliser dumb-init comme PID 1
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage automatisé
CMD ["./start.sh"]