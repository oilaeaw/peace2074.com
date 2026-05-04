# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml CHANGELOG.md ./
COPY apps/nitro-api ./apps/nitro-api
COPY src/shared/data ./src/shared/data

RUN pnpm install --frozen-lockfile --ignore-scripts --filter nitro-api...
RUN NITRO_PRESET=node_server NITRO_APP_BASE_URL=/api pnpm --filter nitro-api build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV="production"
ENV HOST="0.0.0.0"
ENV PORT="3000"
ENV NITRO_APP_BASE_URL="/api"

COPY --from=builder /workspace/apps/nitro-api/.output ./

EXPOSE 3000

CMD ["node", "server/index.mjs"]
