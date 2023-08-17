FROM node:16-alpine@sha256:a1f9d027912b58a7c75be7716c97cfbc6d3099f3a97ed84aa490be9dee20e787

WORKDIR /usr/src/app

RUN npm install --ignore-scripts -g pm2

COPY --chown=node:node "./contracts" "./contracts"
COPY --chown=node:node "./eslint-config" "./eslint-config"
COPY --chown=node:node "./prettier-config" "./prettier-config"
COPY --chown=node:node "./tsconfig" "./tsconfig"
COPY --chown=node:node "./.yarn" "./.yarn"
COPY --chown=node:node [ ".yarnrc.yml", ".nvmrc", ".eslintignore", "package.json", "yarn.lock", "./" ]

RUN yarn set version 3.3.1 && \
    yarn --version && \
    node --version && \
    cd contracts && \
    yarn workspaces focus && \
    yarn build && \
    chown -R node:node .

USER node
WORKDIR /usr/src/app/contracts
ENTRYPOINT [ "yarn" ]

LABEL org.opencontainers.image.source=https://github.com/kleros/kleros-v2
LABEL org.opencontainers.image.title="Kleros v2 Bots"
LABEL org.opencontainers.image.description="Bots for the Kleros v2 arbitration protocol."
LABEL org.opencontainers.image.licenses=MIT
