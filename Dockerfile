# Production build for Node.js application
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install ALL dependencies
RUN npm ci && npm cache clean --force

# Copy application source
COPY . .

# Set NODE_ENV for build
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Create logs directory
RUN mkdir -p /app/logs

# Set proper working directory and environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/api/public/stats || exit 1

# Use tsx to run the TypeScript server directly to avoid compilation issues
CMD ["npx", "tsx", "server/index.ts"]