# @kleros/kleros-v2-contracts

Smart contracts for Kleros v2

## Deployed Addresses

Refresh the list of deployed contracts by running `./scripts/generateDeploymentsMarkdown.sh`.

### v2-alpha-1

#### Chiado

- [ArbitrableExample](https://blockscout.com/gnosis/chiado/address/0xc0fcc96BFd78e36550FCaB434A9EE1210B57225b)
- [ForeignGatewayOnGnosis](https://blockscout.com/gnosis/chiado/address/0x573bcD6ee4aEe152eCC9Cafd2c0820Dc548AF6cC)
- [SortitionSumTreeFactory](https://blockscout.com/gnosis/chiado/address/0xc7e3BF90299f6BD9FA7c3703837A9CAbB5743636)
- [TokenBridge](https://blockscout.com/gnosis/chiado/address/0xbb3c86f9918C3C1d83668fA84e79E876d147fFf2)
- [WETH](https://blockscout.com/gnosis/chiado/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
- [WETHFaucet](https://blockscout.com/gnosis/chiado/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
- [WPNKFaucet](https://blockscout.com/gnosis/chiado/address/0x5898aeE045A25B276369914c3448B72a41758B2c)
- [WrappedPinakionV2](https://blockscout.com/gnosis/chiado/address/0xD75E27A56AaF9eE7F8d9A472a8C2EF2f65a764dd)
- [xKlerosLiquidV2](https://blockscout.com/gnosis/chiado/address/0x34E520dc1d2Db660113b64724e14CEdCD01Ee879)

#### Goerli

- [PNK](https://goerli.etherscan.io/token/0xA3B02bA6E10F55fb177637917B1b472da0110CcC)
- [ArbitrableExample](https://goerli.etherscan.io/address/0xd78dcdde2c5a2bd4bb246bc7db6994b95f7c442c)

#### Arbitrum Goerli

- [PNK](https://goerli.arbiscan.io/token/0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610/token-transfers)
- [ArbitrableExampleEthFee](https://goerli.arbiscan.io/address/0x1fF31be1924f55804350ADe4945f3B3a6a2e15d2)
- [BlockHashRNG](https://goerli.arbiscan.io/address/0x68eE49dfD9d76f3386257a3D0e0A85c0A5519bBD)
- [DisputeKitClassic](https://goerli.arbiscan.io/address/0xcBE3aD699919Cf59efDF715e4B41AF30A0E4c92d)
- [DisputeResolver](https://goerli.arbiscan.io/address/0x3B4edEFd12a467D1C71506ae2eE88828145202b1)
- [HomeGatewayToGnosis](https://goerli.arbiscan.io/address/0xD60CD2151e118Dd796efcb1ceFFcF892226F9b3a)
- [KlerosCore](https://goerli.arbiscan.io/address/0xA429667Abb1A6c530BAd1083df4C69FBce86D696)
- [PolicyRegistry](https://goerli.arbiscan.io/address/0xED503aBA65B28D81444294D1eAa5d84CeFdC2C58)
- [RandomizerRNG](https://goerli.arbiscan.io/address/0xa90f7D2e35718FDE9AD96c8B6667AFcAa4BEfd4d)
- [SortitionModule](https://goerli.arbiscan.io/address/0xa65D3ED6494ec5fcAa115A39D625B2F01786F094)

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
- `GNOSISSCAN_API_KEY`: to verify the source of the newly deployed contracts on **Gnosis chain**.

#### 1. Update the Constructor Parameters (optional)

If some of the constructor parameters (such as the Meta Evidence) needs to change, you need to update the files in the `deploy/` directory.

#### 2. Deploy to a Local Network

The complete deployment is multi-chain, so a deployment to the local network can only simulate either the Home chain or the Foreign chain.

**Shell 1: the node**

```bash
yarn hardhat node --tags nothing
```

**Shell 2: the deploy script**

```bash
yarn deploy --network localhost --tags <Arbitration|VeaMock|ForeignGatewayOnEthereum|HomeGateway>
```

#### 3. Deploy to Public Testnets

```bash
# ArbitrumGoerli to Chiado
yarn deploy --network arbitrumGoerli --tags Arbitration
yarn deploy --network chiado --tags ForeignGatewayOnGnosis
yarn deploy --network chiado --tags KlerosLiquidOnGnosis
yarn deploy --network arbitrumGoerli --tags HomeGatewayToGnosis

# Goerli
yarn deploy --network arbitrumGoerli --tags Arbitration
yarn deploy --network goerli --tags ForeignGatewayOnEthereum
yarn deploy --network arbitrumGoerli --tags HomeGatewayToEthereum
```

The deployed addresses should be displayed to the screen after the deployment is complete. If you missed them, you can always go to the `deployments/<network>` directory and look for the respective file.

#### Running Test Fixtures

**Shell 1: the node**

```bash
yarn hardhat node --tags Arbitration,VeaMock
```

**Shell 2: the test scripts**

```bash
yarn test --network localhost
```

#### 4. Verify the Source Code

This must be done for each network separately.

```bash
# explorer
yarn etherscan-verify --network <arbitrumGoerli|arbitrum|chiado|gnosischain|goerli|mainnet>

# sourcify
yarn sourcify --network <arbitrumGoerli|arbitrum|chiado|gnosischain|goerli|mainnet>

```

## Ad-hoc procedures

### Populating the policy registry and courts

#### 1/ Export the registry data from V1

```bash
for network in mainnet gnosischain
do
  yarn hardhat run scripts/getPoliciesV1.ts  --network $network | tee config/policies.v1.$network.json
  yarn hardhat run scripts/getCourtsV1.ts --network $network | tee config/courts.v1.$network.json
done
```

#### 2/ Import the data to V2 - Local Network

:warning: By default this script populates from `*.mainnet.json`. To populate from `*.gnosischain.json`, set the variable `USE_GNOSIS` to true inside [scripts/populateCourts.ts](scripts/populateCourts.ts).

:warning: It is possible to switch to testnet-friendly court parameters by setting the variable `TESTING_PARAMETERS` to true inside [scripts/populateCourts.ts](scripts/populateCourts.ts).

Shell 1:

```bash
yarn hardhat node --tags Arbitration
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

### Generate deployment artifacts for existing contracts

#### Usage

```bash
scripts/generateDeploymentArtifact.sh <network> <address>
```

#### Example: WETH on Gnosis chain

```bash
scripts/generateDeploymentArtifact.sh gnosischain 0xf8d1677c8a0c961938bf2f9adc3f3cfda759a9d9 > deployments/gnosischain/WETH.json
```

### Push the contracts to a Tenderly project

Ensure that your `$TENDERLY_PROJECT` and `$TENDERLY_USERNAME` is set correctly in `.env`.

```bash
yarn hardhat --network goerli tenderly:push
yarn hardhat --network arbitrumGoerli tenderly:push
```
