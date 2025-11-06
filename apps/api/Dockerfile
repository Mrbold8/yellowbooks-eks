# syntax=docker/dockerfile:1.7
# Base image for building
FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production \
    NX_DAEMON=false
WORKDIR /app

# Install workspace dependencies (cached)
FROM base AS deps
# pnpm -д шаардлагатай файлуудыг л хуулна
RUN corepack enable && corepack prepare pnpm@10 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY libs/contract/package.json libs/contract/package.json
# cached pnpm store ашиглаад бүх deps -ийг суулгана
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Build the API
FROM deps AS build
# workspace -ийн бүх файлуудыг хуулна
COPY . .
# Prisma client -ийг schema-г зааж generate хийнэ
RUN pnpm prisma generate --schema=apps/api/prisma/schema.prisma || true
# Nx ашиглан зөвхөн apps/api -г build хийнэ
RUN pnpm exec nx run api:build:production --skip-nx-cache --verbose

# deploy folder -д зөвхөн apps/api -ийн prod deps болон build файлууд орно
FROM base AS pack
COPY --from=build /app /app
RUN corepack enable && corepack prepare pnpm@10 --activate
# cached pnpm store ашиглаад зөвхөн apps/api -ийн prod deps -ийг deploy хийнэ
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm --filter ./apps/api deploy --prod --legacy /app/out
# Nx -ийн dist output -аас зөвхөн apps/api -г хуулна
RUN mkdir -p /app/out/dist/apps && cp -R /app/dist/apps/api /app/out/dist/apps/api
# Deploy tree дотор Prisma client -ийг дахин generate хийнэ
RUN cd /app/out && pnpm prisma generate --schema=prisma/schema.prisma || true

# Final runtime image
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
# apps/api, node_modules, package.json, -ийг агуулсан pruned output -г хуулна
COPY --from=pack /app/out/ ./
EXPOSE 3000

# Run the API (dist/apps/api/main.js нь Nx build -ээс үүссэн entry point)
CMD ["node", "dist/apps/api/main.js"]
