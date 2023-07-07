FROM --platform=arm64 node:16-bookworm

WORKDIR /usr/src/app

RUN npm install pm2 -g

USER node

COPY --chown=node:node "./node_modules" "./node_modules"
COPY --chown=node:node "./contracts" "./contracts"
COPY --chown=node:node "./eslint-config" "./eslint-config"
COPY --chown=node:node "./prettier-config" "./prettier-config"
COPY --chown=node:node "./tsconfig" "./tsconfig"
COPY --chown=node:node "./.yarn" "./.yarn"
COPY --chown=node:node [ ".yarnrc.yml", ".nvmrc", ".eslintignore", "package.json", "yarn.lock", "./" ]

RUN yarn set version 3.3.1 && \
    yarn --version && \
    node --version

WORKDIR /usr/src/app/contracts

RUN yarn workspaces focus && \
    yarn build

ENTRYPOINT [ "yarn" ]
