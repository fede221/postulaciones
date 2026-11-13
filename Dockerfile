FROM node:20-alpine AS base

# --- deps: install production + dev dependencies ---
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: generate Prisma client and build Next.js ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (schema has no datasource URL — only the adapter needs DATABASE_URL at runtime)
RUN npx prisma generate

RUN npm run build

# --- runner: minimal production image ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache dumb-init
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Public assets
COPY --from=builder /app/public ./public

# Standalone server + static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# CV storage directory (mounted as a volume in production)
RUN mkdir -p /app/storage/cvs && chown -R nextjs:nodejs /app/storage

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider --timeout=5 http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
