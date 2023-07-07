FROM --platform=arm64 node:16-bookworm

WORKDIR /usr/src/app

RUN npm install -g pm2

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
