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

### Using a personal account for development

#### Authentication

Get an API key from the thegraph.com, then authenticate.

```bash
$ yarn run graph auth --product hosted-service
```

#### Deployment

```bash
yarn deploy:arbitrum-goerli
```

### Using the Kleros organization account
Go to the [Deploy Subgraph Action](https://github.com/kleros/kleros-v2/actions/workflows/deploy-subgraph.yml) and click the Run workflow button:

<img width="1265" alt="image" src="https://github.com/kleros/kleros-v2/assets/22213980/da39f584-baaf-42a2-8c6a-6544aee29420">

Pick the appropriate network. There should be a corresponding yarn script in the form of `deploy:<network>` on the master branch.

Then reach out to a maintainer and request his approval.
<img width="1265" alt="image" src="https://github.com/kleros/gtcr-subgraph/assets/22213980/3cea54fb-8382-42c4-a44a-37b4bfbeecee">
