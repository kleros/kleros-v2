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

- [PNK](https://goerli-rollup-explorer.arbitrum.io/token/0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610/token-transfers)
- [BlockHashRNG](https://goerli-rollup-explorer.arbitrum.io/address/0x68eE49dfD9d76f3386257a3D0e0A85c0A5519bBD)
- [DisputeKitClassic](https://goerli-rollup-explorer.arbitrum.io/address/0x34E520dc1d2Db660113b64724e14CEdCD01Ee879)
- [DisputeResolver](https://goerli-rollup-explorer.arbitrum.io/address/0x99392099F988E889Cc9BD55f632C674C3aeEF7F2)
- [FastBridgeSender](https://goerli-rollup-explorer.arbitrum.io/address/0x4d18b9792e0D8F5aF696E71dBEDff8fcBEed6e8C)
- [HomeGatewayToEthereum](https://goerli-rollup-explorer.arbitrum.io/address/0xed12799915180a257985631fbD2ead261eD838cf)
- [KlerosCore](https://goerli-rollup-explorer.arbitrum.io/address/0xdfea19B51cDe76Aa659bB72401AC14FFCFe42Cde)
- [PolicyRegistry](https://goerli-rollup-explorer.arbitrum.io/address/0xd4A4C63bA98c4445E6bb54206d49c8C6c8Bf8871)
- [SortitionSumTreeFactory](https://goerli-rollup-explorer.arbitrum.io/address/0x40a78989317B953e427B3BD87C59eA003fcC2296)

#### Rinkeby - DEPRECATED

- [PNK](https://rinkeby.etherscan.io/token/0x14aba1fa8a31a8649e8098ad067b739cc5708f30)
- [ArbitrableExample](https://rinkeby.etherscan.io/address/0xc0fcc96BFd78e36550FCaB434A9EE1210B57225b)
- [FastBridgeReceiverOnEthereum](https://rinkeby.etherscan.io/address/0x545C731e84c0034d58e57E476A3b7C3929d070CC)
- [ForeignGatewayOnEthereum](https://rinkeby.etherscan.io/address/0x8681CE0CA5706Cf4732d9060e8eC9f865F7d546a)

#### Arbitrum Rinkeby - DEPRECATED

- [PNK](https://testnet.arbiscan.io/token/0x364530164a2338cdba211f72c1438eb811b5c639)
- [Blockhash](https://testnet.arbiscan.io/address/0xe22b595b3e5fF130EcF7056Ef6A4ac351AeA8a58)
- [DisputeKitClassic](https://testnet.arbiscan.io/address/0xA2c538AA05BBCc44c213441f6f3777223D2BF9e5)
- [DisputeResolver](https://testnet.arbiscan.io/address/0x67e8191F61466c57A17542A52F9f39f336A242fD)
- [FastBridgeSender](https://testnet.arbiscan.io/address/0xf8A4a85e7153374A1b9BDA763a84252eC286843b)
- [HomeGatewayToEthereum](https://testnet.arbiscan.io/address/0x4e894c2B60214beC53B60D09F39544518296C07B)
- [IncrementalNG](https://testnet.arbiscan.io/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
- [KlerosCore](https://testnet.arbiscan.io/address/0x815d709EFCF5E69e2e9E2F8d3815d762496a2f0F)
- [PolicyRegistry](https://testnet.arbiscan.io/address/0x76262035D1b280cC0b08024177b837893bcAd3DA)
- [SortitionSumTreeFactory](https://testnet.arbiscan.io/address/0x48ce286978C74c288eA6Bc9a536BcC899DF8D177)

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
yarn --network <arbitrumGoerli|arbitrumRinkeby|arbitrum|goerli|rinkeby|mainnet> etherscan-verify
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
