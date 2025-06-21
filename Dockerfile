# Multi-stage build pour optimiser la taille de l'image
FROM node:20-alpine AS base

# Installer les dépendances système
RUN apk add --no-cache \
    curl \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./
COPY drizzle.config.ts ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Stage de développement
FROM base AS development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# Stage de build
FROM base AS build
RUN npm ci
COPY . .

# Build de l'application
RUN npm run build

# Stage de production
FROM node:20-alpine AS production

# Installer les dépendances système pour la production
RUN apk add --no-cache \
    curl \
    postgresql-client \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de production depuis le stage build
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package*.json ./
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/server ./server
COPY --from=build --chown=nextjs:nodejs /app/shared ./shared
COPY --from=build --chown=nextjs:nodejs /app/drizzle.config.ts ./

# Créer le répertoire des logs
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# Changer vers l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Utiliser dumb-init comme PID 1
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "server/index.js"]