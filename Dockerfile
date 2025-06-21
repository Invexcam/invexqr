# Single-stage production build for Node.js application
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for production server)
RUN npm ci --include=dev && npm cache clean --force

# Copy source code
COPY . .

# Build the application with all dependencies available
RUN npm run build

# Remove dev dependencies that are not needed for runtime (keep vite for server)
RUN npm prune --omit=dev --include=optional && \
    npm install vite@^5.4.19 --save && \
    npm cache clean --force

# Create necessary directories
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3001

# Health check using curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/public/stats || exit 1

# Start the application
CMD ["npm", "start"]