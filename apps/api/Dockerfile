# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Stage 1: Base & Dependencies
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy monorepo manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────
# Stage 2: Builder
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY . .

# Generate Prisma Client
RUN pnpm --filter @petals/api db:generate

# Build workspace packages then API
RUN pnpm --filter @petals/types build
RUN pnpm --filter @petals/api build

# Prune devDependencies for production
RUN pnpm --filter @petals/api --prod deploy /app/pruned

# ─────────────────────────────────────────────────────────────
# Stage 3: Production Runner (Non-Root User)
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl dumb-init wget
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root system user and group
RUN addgroup -g 10001 -S petals && \
    adduser -u 10001 -S appuser -G petals

# Copy production dependencies & built artifacts
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/packages/types/dist ./node_modules/@petals/types/dist

# Ensure permissions
RUN chown -R appuser:petals /app

USER appuser

EXPOSE 3000

# Production Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
