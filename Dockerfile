# Production image for the webapp (Next.js + Bun monorepo + Prisma).
# Build:  docker build -t puntodeagua-web .
# Run:    docker run --env-file .env -p 3000:3000 puntodeagua-web
FROM oven/bun:1.4 AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY . .
RUN bun install --frozen-lockfile
# Placeholders so `next build` can evaluate the auth/db config. They only exist
# in this build stage; the real values come from the runtime environment.
ENV NEXT_TELEMETRY_DISABLED=1 SKIP_ENV_VALIDATION=1 \
  DATABASE_URL=postgresql://build:build@localhost:5432/build \
  AUTH_SECRET=build-placeholder \
  EMAIL_SERVER=smtp://build:build@localhost:25 \
  EMAIL_FROM=build@localhost
RUN bun run -F webapp build

FROM base AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build /app /app
WORKDIR /app/apps/webapp
EXPOSE 3000
CMD ["bun", "run", "start"]
