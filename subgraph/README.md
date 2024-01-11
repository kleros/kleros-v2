# @kleros/kleros-v2-subgraph

## Deployments

### Testnet

- [Core](https://thegraph.com/studio/subgraph/kleros-v2-core-testnet/)
- [Dispute Registry Template - Arbitrum Sepolia](https://thegraph.com/studio/subgraph/kleros-v2-drt-arbisep-testnet/)

### Devnet

- [Core](https://thegraph.com/studio/subgraph/kleros-v2-core-devnet/)
- [Dispute Registry Template - Arbitrum Sepolia](https://thegraph.com/studio/subgraph/kleros-v2-drt-arbisep-devnet/)
- [Dispute Registry Template - Gnosis]()
- [Dispute Registry Template - Sepolia]()

## Build

```bash
# update subgraph.yml using the contract deployment artifacts
$ yarn update:arbitrum-sepolia-devnet

$ yarn codegen

$ yarn build
```

## Deployment to The Graph Studio

### Using a personal account for development

#### Authentication

Get an API key from the thegraph.com, then authenticate.

```bash
$ yarn run graph auth --studio
```

#### Deployment

```bash
# bump the package version number
yarn version patch

# deploy the new version
yarn deploy:arbitrum-sepolia-devnet

# commit the new version number
git commit -m "chore: subgraph deployment"
```

### Using the Kleros organization account

Go to the [Deploy Subgraph Action](https://github.com/kleros/kleros-v2/actions/workflows/deploy-subgraph.yml) and click the Run workflow button:

<img width="1265" alt="image" src="https://github.com/kleros/kleros-v2/assets/22213980/da39f584-baaf-42a2-8c6a-6544aee29420">

Pick the appropriate network. There should be a corresponding yarn script in the form of `deploy:<network>` on the master branch.

Then reach out to a maintainer and request his approval.
<img width="1265" alt="image" src="https://github.com/kleros/gtcr-subgraph/assets/22213980/3cea54fb-8382-42c4-a44a-37b4bfbeecee">
