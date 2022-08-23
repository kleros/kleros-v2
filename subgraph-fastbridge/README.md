# @kleros/kleros-v2-subgraph-fastbridge

## Deployments

- [kleros/fastbridge-arbitrum-rinkeby](https://thegraph.com/hosted-service/subgraph/kleros/fastbridge-arbitrum-rinkeby)

## Build

```bash
$ yarn

$ yarn codegen

$ yarn build
```

## Deployment to The Graph (hosted service)

### Authentication

Get an API key from the thegraph.com, then authenticate.

```bash
$ yarn run graph auth --product hosted-service
```

### Deployment

```bash
yarn deploy
```

## Deployment to a local Graph node

_Credits to the [scaffold-eth service package](https://github.com/scaffold-eth/scaffold-eth/tree/b03d07f15882db626300ffa04f222736b2a22f81/packages/services/graph-node)_

Preconfigured Docker image for running a Graph Node.

## Usage

**Prerequisite**: docker and docker-compose.

```bash
$ docker-compose up -d
Starting graph-node_postgres_1 ... done
Starting graph-node_ipfs_1     ... done
Starting graph-node_graph-node_1 ... done

$ docker-compose logs -f
...
```

This will start docker containers for the following services:

- IPFS,
- Postgres
- **Graph Node** connecting to the Arbitrum Rinkeby official RPC

This also creates persistent data directories for IPFS and Postgres in `./data/ipfs` and `./data/postgres`.

Once this is up and running, you can use [`graph-cli`](https://github.com/graphprotocol/graph-cli) to create and deploy your subgraph to the running Graph Node.

```bash
# First time only.
$ yarn create-local
Created subgraph: fastbridge

$ yarn deploy-local --version-label v0.0.1
✔ Apply migrations
✔ Load subgraph from subgraph.yaml
  Compile data source: FastBridgeSender => build/FastBridgeSender/FastBridgeSender.wasm
✔ Compile subgraph
  Copy schema file build/schema.graphql
  Write subgraph file build/FastBridgeSender/abis/FastBridgeSender.json
  Write subgraph manifest build/subgraph.yaml
✔ Write compiled subgraph to build/
  Add file to IPFS build/schema.graphql
                .. Qmb3Uahj4qKh5u3V4KuraXJqsrUVwPtvva1KQQSb5tLov9
  Add file to IPFS build/FastBridgeSender/abis/FastBridgeSender.json
                .. QmQas2SuTQH6zybTVMGBym76kyBoTp7MwkogcmtHAeMoRj
  Add file to IPFS build/FastBridgeSender/FastBridgeSender.wasm
                .. QmSLfCYp19WW5JEiaKdmcGFgBCJ5DA723dEkM6QvXE2eCa
✔ Upload subgraph to IPFS

Build completed: QmWjRVXec6auQdnpvYJ7F8vW7PzkJHYJhFtorWZAhtP9A3

Deployed to http://localhost:8000/subgraphs/name/fastbridge/graphql

Subgraph endpoints:
Queries (HTTP):     http://localhost:8000/subgraphs/name/fastbridge
```

## Access

### Graph Node

- GraphiQL: `http://localhost:8000/`
- HTTP: `http://localhost:8000/subgraphs/name/<subgraph-name>`
- WebSockets: `ws://localhost:8001/subgraphs/name/<subgraph-name>`
- Admin: `http://localhost:8020/`

### IPFS

- `127.0.0.1:5001` or `/ip4/127.0.0.1/tcp/5001`

### Postgres

- `postgresql://graph-node:let-me-in@localhost:5432/graph-node`
