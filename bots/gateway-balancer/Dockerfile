# syntax=docker/dockerfile:1
# Gateway balancer bot. The bot is a Yarn workspace, so build from the repository root:
#
#   docker build -f bots/gateway-balancer/Dockerfile -t kleros/gateway-balancer-bot .
#
# The image runs `tsx src/main.ts`, exactly what `yarn start` runs: the sources use extensionless ESM imports, so
# there is no compiled output to ship, and the bot's full install (tsx among the dev dependencies) is the price of
# that. Secrets come from the environment at run time only; nothing in this image reads a .env file and no secret
# is baked in. See RUNBOOK.md for running it.
FROM node:22-bookworm-slim

ENV YARN_ENABLE_SCRIPTS=false \
    YARN_ENABLE_GLOBAL_CACHE=false \
    YARN_ENABLE_TELEMETRY=0
WORKDIR /app

# The manifests of every workspace, so the lockfile resolves, then the bot's dependencies only. Lifecycle scripts
# are off: the root postinstall is a developer hook and the bot has no native dependency (node:sqlite is built in).
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
COPY .yarn/plugins ./.yarn/plugins
COPY bots/gateway-balancer/package.json ./bots/gateway-balancer/
COPY contracts/package.json ./contracts/
COPY eslint-config/package.json ./eslint-config/
COPY kleros-app/package.json ./kleros-app/
COPY kleros-sdk/package.json ./kleros-sdk/
COPY prettier-config/package.json ./prettier-config/
COPY subgraph/package.json ./subgraph/
COPY tsconfig ./tsconfig
COPY web/package.json ./web/
COPY web-devtools/package.json ./web-devtools/
RUN node .yarn/releases/yarn-4.10.3.cjs workspaces focus @kleros/gateway-balancer-bot \
    && rm -rf .yarn/cache \
    && test -f node_modules/tsx/dist/cli.mjs

COPY bots/gateway-balancer/tsconfig.json ./bots/gateway-balancer/
COPY bots/gateway-balancer/config ./bots/gateway-balancer/config
COPY bots/gateway-balancer/src ./bots/gateway-balancer/src

WORKDIR /app/bots/gateway-balancer
# The journal lives in data/ (platform.journalPath): mount a persistent volume there. The non-secret configuration
# is mounted at config/config.json (GATEWAY_BALANCER_CONFIG); the shipped config/ holds only the examples.
RUN mkdir -p data && chown -R node:node data config
USER node
VOLUME ["/app/bots/gateway-balancer/data"]

# /healthz binds to 127.0.0.1 inside the container by default, which is where this check reads it. To publish the
# port, set health.host to 0.0.0.0 and health.allowNonLoopback to true (and put it behind your own proxy).
EXPOSE 8080
HEALTHCHECK --interval=60s --timeout=10s --start-period=120s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:8080/healthz').then((r) => process.exit(r.status === 200 ? 0 : 1), () => process.exit(1))"

# `start` by default; `status` and `reconcile` are the other commands (RUNBOOK.md).
ENTRYPOINT ["node", "/app/node_modules/tsx/dist/cli.mjs", "src/main.ts"]
CMD ["start"]
