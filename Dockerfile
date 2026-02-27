# ---- Stage 1: Install dependencies ----
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ---- Stage 2: Build the application ----
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars: Next.js inlines NEXT_PUBLIC_* at build time
ARG NEXT_PUBLIC_PUSHER_APP_KEY
ENV NEXT_PUBLIC_PUSHER_APP_KEY=$NEXT_PUBLIC_PUSHER_APP_KEY

# Placeholder values so next build can collect page data without crashing.
# Real values are injected at runtime via docker run -e.
ENV UPSTASH_REDIS_REST_URL="https://placeholder.upstash.io"
ENV UPSTASH_REDIS_REST_TOKEN="placeholder"
ENV GOOGLE_CLIENT_ID="placeholder"
ENV GOOGLE_CLIENT_SECRET="placeholder"
ENV NEXTAUTH_SECRET="placeholder"
ENV PUSHER_APP_ID="placeholder"
ENV PUSHER_APP_SECRET="placeholder"

RUN corepack enable pnpm && pnpm build

# ---- Stage 3: Production runner ----
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output and static/public assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
