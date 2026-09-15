# ─── Base stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# Install dumb-init for proper signal handling in Docker
RUN apk add --no-cache dumb-init

# Copy package manifests only (layer caching)
COPY package.json ./

# ─── Development stage ─────────────────────────────────────────────────────────
FROM base AS development

ENV NODE_ENV=development

RUN npm install

# Copy source code (after deps for cache efficiency)
COPY . .

# Create runtime directories
RUN mkdir -p logs uploads

EXPOSE 5000

# Use dumb-init to correctly handle SIGTERM/SIGINT in containers
CMD ["dumb-init", "node", "--loader", "ts-node/esm", "src/index.ts"]

# ─── Build stage ───────────────────────────────────────────────────────────────
FROM base AS builder

ENV NODE_ENV=production

# Install all deps (including devDeps for build)
RUN npm ci

COPY . .
RUN npm run build

# ─── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package manifest and install production deps only
COPY package.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create runtime directories with correct ownership
RUN mkdir -p logs uploads && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 5000

# Health check — Docker will mark container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["dumb-init", "node", "dist/index.js"]
