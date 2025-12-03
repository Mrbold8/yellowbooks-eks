# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production \
    NX_DAEMON=false \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Deps layer
FROM base AS deps
RUN corepack enable && corepack prepare pnpm@10 --activate
# pnpm -д шаардлагатай файлуудыг л хуулна
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/web/package.json apps/web/package.json
# If web imports local libs, include their package.json too
COPY libs/contract/package.json libs/contract/package.json
# cached pnpm store ашиглаад бүх deps -ийг суулгана
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build layer
FROM deps AS build
# workspace -ийн бүх файлуудыг хуулна
COPY . .
# Ensure Prisma Client is generated even when pnpm skips lifecycle scripts
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm exec prisma generate --schema=apps/api/prisma/schema.prisma
# public API URL -г client болон server талд ашиглахын тулд орчны хувьсагч болгон оруулна
ARG NEXT_PUBLIC_API_BASE=http://localhost:3000
ARG API_BASE=http://localhost:3000
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV API_BASE=$API_BASE
# Nx ашиглан production build гүйцэтгэнэ
RUN pnpm exec nx run web:build --configuration=production --skip-nx-cache

# Runtime tree-г бэлдэх
FROM base AS pack
COPY --from=build /app /app
RUN STANDALONE_DIR=/app/dist/apps/web/.next/standalone; \
    [ -d "$STANDALONE_DIR" ] || STANDALONE_DIR=/app/apps/web/.next/standalone; \
    mkdir -p /app/out && rm -rf /app/out/*; \
    cp -R "$STANDALONE_DIR"/. /app/out
RUN STATIC_DIR=/app/dist/apps/web/.next/static; \
    [ -d "$STATIC_DIR" ] || STATIC_DIR=/app/apps/web/.next/static; \
    mkdir -p /app/out/apps/web/.next/static && rm -rf /app/out/apps/web/.next/static/*; \
    cp -R "$STATIC_DIR"/. /app/out/apps/web/.next/static
RUN PUBLIC_DIR=/app/dist/apps/web/public; \
    [ -d "$PUBLIC_DIR" ] || PUBLIC_DIR=/app/apps/web/public; \
    mkdir -p /app/out/apps/web/public && rm -rf /app/out/apps/web/public/*; \
    cp -R "$PUBLIC_DIR"/. /app/out/apps/web/public

# Runtime 
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3001
ARG NEXT_PUBLIC_API_BASE=http://localhost:3000
ARG API_BASE=http://localhost:3000
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV API_BASE=$API_BASE
WORKDIR /app
COPY --from=pack /app/out/ ./
WORKDIR /app/apps/web

EXPOSE 3001
CMD ["node", "server.js"]
