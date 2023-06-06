# @kleros/kleros-v2-subgraph

## Deployments

### Arbitrum Goerli (hosted service)

- [Subgraph explorer](https://thegraph.com/explorer/subgraph/kleros/kleros-v2-core-arbitrum-goerli)
- [Subgraph endpoints](https://api.thegraph.com/subgraphs/name/kleros/kleros-v2-core-arbitrum-goerli)

## Build

```bash
# update subgraph.yml using the contract deployment artifacts
$ yarn update:arbitrum-goerli

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
yarn deploy:arbitrum-goerli
```
