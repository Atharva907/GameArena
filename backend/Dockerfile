ARG DATABASE_URL=postgresql://gamearena:gamearena-dev@postgres:5432/gamearena?schema=public

FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app/backend
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma
COPY backend/scripts ./scripts

RUN npm ci

FROM deps AS build
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN npm prune --omit=dev

FROM base AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
ENV BACKEND_PORT=4000
ENV PORT=4000

COPY --from=build --chown=node:node /app/backend/node_modules ./node_modules
COPY --from=build --chown=node:node /app/backend/package.json ./package.json
COPY --from=build --chown=node:node /app/backend/package-lock.json ./package-lock.json
COPY --from=build --chown=node:node /app/backend/prisma ./prisma
COPY backend/src ./src

USER node

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --retries=12 CMD node -e "fetch('http://127.0.0.1:4000/api/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
