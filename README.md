<p align="center">
  <a href="https://kleros.io">
    <img alt="Kleros" src="https://github.com/kleros/court/blob/master/public/icon-512.png?raw=true" width="128">
  </a>
</p>

<p align="center">
  <b style="font-size: 32px;">Kleros v2</b>
</p>

<p align="center">
  <a href="https://api.securityscorecards.dev/projects/github.com/kleros/kleros-v2"><img src="https://api.securityscorecards.dev/projects/github.com/kleros/kleros-v2/badge" alt="OpenSSF Scorecard"></a>
  <a href="https://sonarcloud.io/summary/new_code?id=kleros_kleros-v2"><img src="https://sonarcloud.io/api/project_badges/measure?project=kleros_kleros-v2&metric=security_rating" alt="Security Rating"></a>
  <a href="https://sonarcloud.io/summary/new_code?id=kleros_kleros-v2"><img src="https://sonarcloud.io/api/project_badges/measure?project=kleros_kleros-v2&metric=alert_status" alt="Quality Gate Status"></a>
  <a href="https://sonarcloud.io/summary/new_code?id=kleros_kleros-v2"><img src="https://sonarcloud.io/api/project_badges/measure?project=kleros_kleros-v2&metric=bugs" alt="Bugs"></a>
  <a href="https://sonarcloud.io/summary/new_code?id=kleros_kleros-v2"><img src="https://sonarcloud.io/api/project_badges/measure?project=kleros_kleros-v2&metric=reliability_rating" alt="Reliability Rating"></a>
  <a href="https://sonarcloud.io/summary/new_code?id=kleros_kleros-v2"><img src="https://sonarcloud.io/api/project_badges/measure?project=kleros_kleros-v2&metric=sqale_rating" alt="Maintainability Rating"></a>
  </br>
  <a href="https://github.com/kleros/kleros-v2/actions/workflows/contracts-testing.yml"><img src="https://github.com/kleros/kleros-v2/actions/workflows/contracts-testing.yml/badge.svg?branch=master" alt="Unit testing"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly"></a>
  <a href="https://github.com/prettier/prettier"><img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with Prettier"></a>
  </br>
  <a href="https://www.gitpoap.io/gh/kleros/kleros-v2"><img src="https://public-api.gitpoap.io/v1/repo/kleros/kleros-v2/badge" alt="GitPoap badge"></a>
</p>

---

## Deployments

##### ⛓️ [Contracts addresses](contracts/README.md#deployments)

##### 🗃️ [Subgraph endpoints](subgraph/README.md#deployments)

##### ⚖️ [Web frontend](web/README.md#court-deployments)

## Content

| Package                       | Description                                                                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[bots](/bots)**             | Automation of the on-chain upkeep of the smart contracts. Anyone willing to spend some gas may run these bots and contribute to the upkeep operations.      |
| **[contracts](/contracts)**   | Smart contracts of the arbitration protocol.                                                                                                                |
| **[kleros-app](/kleros-app)** | Library of React hooks and utilities shared by the Kleros frontend apps.                                                                                    |
| **[kleros-sdk](/kleros-sdk)** | SDK which facilitates the creation of arbitrable applications, the interactions with the arbitrator, the rendering of the dispute and evidence information. |
| **[subgraph](/subgraph)**     | The indexing layer.                                                                                                                                         |
| **[web](/web)**               | The court frontend intended for the jurors and parties in a dispute.                                                                                        |

## Contributing

### Prerequisites

- Install NodeJS 16:
  - on Red Hat Linux: `sudo dnf module install nodejs:16`
  - on Ubuntu Linux: `sudo snap install node --classic`
  - on MacOS via [brew](https://brew.sh/): `brew install node`
- Install Yarn v1.22: `npm install -g yarn`
  - Then [upgrade](https://yarnpkg.com/getting-started/install#updating-to-the-latest-versions) Yarn to v3: `yarn set version berry`
- Install Volta.sh: `curl https://get.volta.sh | bash`
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) to run the local graph node.
- Shell utilities: [jq](https://stedolan.github.io/jq/), [yq](https://mikefarah.gitbook.io/yq/)
  - on Red Hat Linux: `sudo dnf install jq yq`
  - on Ubuntu Linux: `sudo snap install jq yq`
  - on MacOS via [brew](https://brew.sh/): `brew install jq yq`

### Install the dependencies

```bash
$ yarn install

# Foundry libraries
$ git submodule update --init --recursive -j 4
```

### [Hardhat CLI auto-completion](https://hardhat.org/guides/shorthand.html) (optional)

```bash
$ npm i -g hardhat-shorthand

$ hardhat-completion install
✔ Which Shell do you use ? · bash
✔ We will install completion to ~/.bashrc, is it ok ? (y/N) · true

$ exec bash
```

### Full Stack Local Deployment

Run the commands below from the top-level folder. Alternatively, it is possible to `cd` into the relevant package first and then call yarn without `workspace @kleros/xxxx`.

#### Shortcut using tmux

If you have **[tmux](https://github.com/tmux/tmux/wiki)** installed, you can get started quickly with a single command.

```bash
$ yarn local-stack
```

![terminal](/docs/local-stack-2.png)

#### Shell 1 - Local RPC with Contracts Deployed

```bash
$ yarn workspace @kleros/kleros-v2-contracts start-local
...
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

⏳ Wait until deployment is complete.

##### In a new terminal run:

```bash
$ yarn workspace @kleros/kleros-v2-contracts populate:local
```

This will populate the courts local by pulling devnet courts.

> Note: Whenever contracts are redeployed or their ABIs change, you must regenerate
> the typed wagmi/viem contract bindings used by the frontend.
>
> ```bash
> yarn workspace @kleros/kleros-v2-contracts viem:generate-hardhat
> ```

#### Shell 2 - Local Graph Node

> Requires Docker desktop to be installed and running

```bash
$ yarn workspace @kleros/kleros-v2-subgraph start-local-indexer
...
graph-node-graph-node-1  | INFO Successfully connected to IPFS node at: http://ipfs:5001/
graph-node-graph-node-1  | INFO Pool successfully connected to Postgres, pool: main, shard: primary, component: Store
...
graph-node-graph-node-1  | INFO Connected to Ethereum, capabilities: archive, traces, network_version: 31337, provider: mainnet-rpc-0
```

⏳ Wait until the graph service is ready.

#### Shell 3 - Subgraph Rebuild and Local Deploy

:warning: This step modifies `subgraph.yaml` and creates a backup file. See further down on how to restore it.

```bash
$ yarn workspace @kleros/kleros-v2-subgraph rebuild-deploy:local
...
✔ Upload subgraph to IPFS

Build completed: QmZVaZQ9qcXPia9YnFEKk7D1dEDHbfyDiJi1sqJ6E1NydB

Deployed to http://localhost:8000/subgraphs/name/kleros/kleros-v2-core-local/graphql

Subgraph endpoints:
Queries (HTTP):     http://localhost:8000/subgraphs/name/kleros/kleros-v2-core-local
```

#### Shell 4 - Frontend Pointing to the Local Subgraph

> Note: If not already built, or on any change, build `kleros-app` first.
>
> ```bash
> yarn workspace @kleros/kleros-app build
> ```

```bash
$ yarn workspace @kleros/kleros-v2-web start-local
✔ Parse Configuration
✔ Generate outputs
✔ Validating plugins
✔ Resolving contracts
✔ Running plugins
✔ Writing to src/hooks/contracts/generated.ts
Server running at http://localhost:1234
✨ Built in 2.35s
```

### Redeploying

```bash
# Contracts
$ yarn workspace @kleros/kleros-v2-contracts deploy-local

# If contracts were updated
$ yarn workspace @kleros/kleros-v2-contracts viem:generate-hardhat

# Subgraph
$ yarn workspace @kleros/kleros-v2-subgraph rebuild-deploy:local

# If contracts were updated, restart web server to regenerate the wagmi hooks
$ yarn workspace @kleros/kleros-v2-web start-local

```

### Simulating Arbitration Activity

```bash
$ yarn workspace @kleros/kleros-v2-contracts simulate-local

```

### Stopping

Just press `Ctrl + c` in each terminal.

#### Docker containers and data removal

`yarn workspace @kleros/kleros-v2-subgraph stop-local-indexer`

#### Restoring subgraph.yaml

##### From a backup file

Every versions were saved as `subgraph.yaml.bak.<timestamp>`.

##### Based on the ArbitrumSepolia deployment artifacts

`yarn workspace @kleros/kleros-v2-subgraph update`

##### Based on the last commit

`git restore subgraph.yaml`

## Run a local Blockscout explorer to inspect transactions on hardhat (Optional)

Make sure [hardhat node](#####shell-1---local-rpc-with-contracts-deployed) is running.

#### Step 1 - Clone [blockscout](https://github.com/blockscout/blockscout/blob/master/docker-compose/README.md) repo

```bash
git clone https://github.com/blockscout/blockscout.git
```

#### Step 2: Start the Docker compose stack

```bash
docker-compose -f hardhat-network.yml up -d
```

This should run a Blockscout locally at http://localhost.
