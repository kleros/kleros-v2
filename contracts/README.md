# @kleros/kleros-v2-contracts

Smart contracts for Kleros v2

## Deployed Addresses

Refresh the list of deployed contracts by running `./scripts/generateDeploymentsMarkdown.sh`.

### v2-prealpha-3

#### Goerli

- [PNK](https://goerli.etherscan.io/token/0xA3B02bA6E10F55fb177637917B1b472da0110CcC)
- [ArbitrableExample](https://goerli.etherscan.io/address/0xd78dcdde2c5a2bd4bb246bc7db6994b95f7c442c)
- [FastBridgeReceiverOnEthereum](https://goerli.etherscan.io/address/0x8F53f533531a40BdaA832254e282ed1b21D83F71)
- [ForeignGatewayOnEthereum](https://goerli.etherscan.io/address/0x4401a368dea8d5761aeeffd3c4a674086dea0666)

#### Arbitrum Goerli

- [PNK](https://goerli.arbiscan.io/token/0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610/token-transfers)
- [BlockHashRNG](https://goerli.arbiscan.io/address/0x68eE49dfD9d76f3386257a3D0e0A85c0A5519bBD)
- [DisputeKitClassic](https://goerli.arbiscan.io/address/0xde31F2245d164620d08f5b0f8D43dCe8B9708373)
- [DisputeResolver](https://goerli.arbiscan.io/address/0xa1f52474CFa1ee78758a4bBa35DE547133Bda62f)
- [FastBridgeSender](https://goerli.arbiscan.io/address/0x4d18b9792e0D8F5aF696E71dBEDff8fcBEed6e8C)
- [HomeGatewayToEthereum](https://goerli.arbiscan.io/address/0xed12799915180a257985631fbD2ead261eD838cf)
- [KlerosCore](https://goerli.arbiscan.io/address/0x4d7858e73a8842b5e6422D08a3349924dD062AbB)
- [PolicyRegistry](https://goerli.arbiscan.io/address/0xAF0F49Fe110b48bd512F00d51D141F023c9a9106)
- [RandomizerRNG](https://goerli.arbiscan.io/address/0xb82D1eAD813C3a2E729F288276cc402343423Bad)
- [SortitionSumTreeFactory](https://goerli.arbiscan.io/address/0x40a78989317B953e427B3BD87C59eA003fcC2296)

## Getting Started

### Install the Dependencies

```bash
yarn install
```

### Run Tests

```bash
yarn test
```

### Compile the Contracts

```bash
yarn build
```

### Run Linter on Files

```bash
yarn lint
```

### Fix Linter Issues on Files

```bash
yarn fix
```

### Deploy Instructions

**NOTICE:** the commands below work only if you are inside the `contracts/` directory.

#### 0. Set the Environment Variables

Copy `.env.example` file as `.env` and edit it accordingly.

```bash
cp .env.example .env
```

The following env vars are required:

- `PRIVATE_KEY`: the private key of the deployer account used for the testnets.
- `MAINNET_PRIVATE_KEY`: the private key of the deployer account used for Mainnet.
- `INFURA_API_KEY`: the API key for infura.

The ones below are optional:

- `ETHERSCAN_API_KEY`: to verify the source of the newly deployed contracts on **Etherscan**.
- `ARBISCAN_API_KEY`: to verify the source of the newly deployed contracts on **Arbitrum**.

#### 1. Update the Constructor Parameters (optional)

If some of the constructor parameters (such as the Meta Evidence) needs to change, you need to update the files in the `deploy/` directory.

#### 2. Deploy to a Local Network

The complete deployment is multi-chain, so a deployment to the local network can only simulate either the Home chain or the Foreign chain.

**Shell 1: the node**

```bash
yarn node --tags nothing
```

**Shell 2: the deploy script**

```bash
yarn deploy --network localhost --tags <Arbitration|VeaMock>
```

#### 3. Deploy to Public Testnets

```bash
# Goerli
yarn deploy --network arbitrumGoerli --tags Arbitration
yarn deploy --network goerli --tags ForeignGateway
yarn deploy --network arbitrumGoerli --tags HomeGateway
```

The deployed addresses should be output to the screen after the deployment is complete.
If you miss that, you can always go to the `deployments/<network>` directory and look for the respective file.

#### Running Test Fixtures

**Shell 1: the node**

```bash
yarn node --tags Arbitration,VeaMock
```

**Shell 2: the test scripts**

```bash
yarn test --network localhost
```

#### 4. Verify the Source Code for Contracts

This must be done for each network separately.

```bash
yarn etherscan-verify --network <arbitrumGoerli|arbitrumRinkeby|arbitrum|goerli|rinkeby|mainnet>
```

## Ad-hoc procedures

### Populating the policy registry and courts

#### 1/ Export the registry data from V1

```bash
yarn hardhat run scripts/getPoliciesV1.ts  --network mainnet | tee policies.v1.json
yarn hardhat run scripts/getCourtsV1.ts --network mainnet | tee courts.v1.json
```

#### 2/ Import the data to V2 - Local Network

Shell 1:

```bash
yarn node --tags Arbitration
```

Shell 2:

```bash
yarn hardhat run scripts/populatePolicyRegistry.ts --network localhost
yarn hardhat run scripts/populateCourts.ts --network localhost
```

#### 3/ Import the data to V2 - Public Testnet

```bash
yarn hardhat run scripts/populatePolicyRegistry.ts --network arbitrumGoerli
yarn hardhat run scripts/populateCourts.ts --network arbitrumGoerli
```

### Push the contracts to a Tenderly project

Ensure that your `$TENDERLY_PROJECT` and `$TENDERLY_USERNAME` is set correctly in `.env`.

```bash
yarn hardhat --network goerli tenderly:push
yarn hardhat --network arbitrumGoerli tenderly:push
```
