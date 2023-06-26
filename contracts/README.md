# @kleros/kleros-v2-contracts

Smart contracts for Kleros v2

## Deployed Addresses

Refresh the list of deployed contracts by running `./scripts/generateDeploymentsMarkdown.sh`.

### Kleros Chain (Orbit L3 Rollup)

#### Kleros Protocol

- [ArbitrableExample](http://localhost:4000/address/0x5447cB71CED29767832A22B3fD6B82E1DA6593c6)
- [DAI](http://localhost:4000/address/0x5A407DcbD0F83ECbc1894C4B4f8Fc5b699D4822F)
- [DisputeKitClassic](http://localhost:4000/address/0xC89312e08C792445B87714A3938BE0b43d0D929a)
- [DisputeResolver](http://localhost:4000/address/0xC520BF3cb4E03a5D5AED2144A95CFc8bd5B1536B)
- [KlerosCore](http://localhost:4000/address/0x144041583291AD96Bff693E28D3eACFe12cb0a03)
- [PolicyRegistry](http://localhost:4000/address/0xed12799915180a257985631fbD2ead261eD838cf)
- [RandomizerMock](http://localhost:4000/address/0x4d18b9792e0D8F5aF696E71dBEDff8fcBEed6e8C)
- [RandomizerRNG](http://localhost:4000/address/0xd08452AEE7ab5bE3BF6733BA0d3F0CFdaf060Aa2)
- [SortitionModule](http://localhost:4000/address/0x34caAa0f31fF13Fb9732500D97dFc5D8c6343eDc)
- [WETH](http://localhost:4000/address/0x99392099F988E889Cc9BD55f632C674C3aeEF7F2)

#### Rollup Contracts

- [Rollup](https://goerli.arbiscan.io/address/0xCbe972b865D4Dc0D077FE1f293FD8B9d2aE74370)
- [Inbox](https://goerli.arbiscan.io/address/0x6DcAaD11B3A85548EDec4247D1bb406eBDc4101F)
- [Outbox](https://goerli.arbiscan.io/address/0x5d3e1A839438386E5760e33496dBF8b2d4A99aff)
- [Admin Proxy](https://goerli.arbiscan.io/address/0x8341e3127585fE74B41190e31a05C7da668c779f)
- [Sequencer Inbox](https://goerli.arbiscan.io/address/0xb0cb33Fc9c04661fe54C747e484155A51922A50D)
- [Bridge](https://goerli.arbiscan.io/address/0xfbd46bc3F038eC0E04816AcA23be68Ac0663A84E)
- [Utils](https://goerli.arbiscan.io/address/0x54F8e1d51e4B97d046aE6651fe260ADe4139D553)
- [Validator Wallet Creator](https://goerli.arbiscan.io/address/0x5D8a0a8ee09185d0898f03a057dde4BB3EaDA601)
- Deployed at block number: [28323884](https://goerli.arbiscan.io/block/28323884)

#### Validators

- [Validator #1](https://goerli.arbiscan.io/address/0xdD3748f5DD1212fAa83a8f1233cF610A810c487B)

#### Batch Poster

- [Batch Poster](https://goerli.arbiscan.io/address/0x4288B029865667fE12CF1c9e69d1Da0ab24e946C)

### Foreign Chains

#### Chiado

- [ArbitrableExample](https://blockscout.com/gnosis/chiado/address/0xf534e055758884c71304028814Ba25B2CE6903e5)
- [DisputeResolver](https://blockscout.com/gnosis/chiado/address/0x433eD78895df1df7668C40b3e82d54410331F942)
- [ForeignGatewayOnGnosis](https://blockscout.com/gnosis/chiado/address/0x2357ef115E98d171b083105E9b398231206989A3)
- [SortitionSumTreeFactory](https://blockscout.com/gnosis/chiado/address/0xc7e3BF90299f6BD9FA7c3703837A9CAbB5743636)
- [TokenBridge](https://blockscout.com/gnosis/chiado/address/0xbb3c86f9918C3C1d83668fA84e79E876d147fFf2)
- [WETH](https://blockscout.com/gnosis/chiado/address/0x2DFC9c3141268e6eac04a7D6d98Fbf64BDe836a8)
- [WETHFaucet](https://blockscout.com/gnosis/chiado/address/0x22CB016c4b57413ca4DF5F1AC44a0E0d3c69811F)
- [WPNKFaucet](https://blockscout.com/gnosis/chiado/address/0x5898aeE045A25B276369914c3448B72a41758B2c)
- [WrappedPinakionV2](https://blockscout.com/gnosis/chiado/address/0xD75E27A56AaF9eE7F8d9A472a8C2EF2f65a764dd)
- [xKlerosLiquidV2](https://blockscout.com/gnosis/chiado/address/0x34E520dc1d2Db660113b64724e14CEdCD01Ee879)

#### Goerli

- [PNK](https://goerli.etherscan.io/token/0xA3B02bA6E10F55fb177637917B1b472da0110CcC)

#### Arbitrum Goerli

- [PNK](https://goerli.arbiscan.io/token/0x4DEeeFD054434bf6721eF39Aa18EfB3fd0D12610/token-transfers)

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
yarn deploy --network chiado --tags ForeignArbitrable
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
