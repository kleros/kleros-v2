# @kleros/kleros-v2-subgraph

## Deployments

### Arbitrum Goerli (hosted service)

- [Subgraph explorer](https://thegraph.com/explorer/subgraph/kleros/kleros-v2-core-arbitrum-goerli)
- [Subgraph endpoints](https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli)

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
