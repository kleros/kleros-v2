# @kleros/kleros-v2-contracts

Smart contracts for Kleros v2

## Deployed Addresses

Refresh the list of deployed contracts by running `./scripts/generateDeploymentsMarkdown.sh`.

### Rinkeby

- [FastBridgeReceiver](https://rinkeby.etherscan.io/address/0x300CbF0829762FeDc90287D08aeDf261EE6ED8eB)
- [ForeignGateway](https://rinkeby.etherscan.io/address/0x8F1a2B8F9b04320375856580Fc6B1669Cb12a9EE)

### Arbitrum Rinkeby

- [ConstantNG](https://testnet.arbiscan.io/address/0x4401A368dea8D5761AEEFfd3c4a674086dea0666)
- [DisputeKitClassic](https://testnet.arbiscan.io/address/0xD78DCddE2C5a2Bd4BB246Bc7dB6994b95f7c442C)
- [FastBridgeSender](https://testnet.arbiscan.io/address/0x34E520dc1d2Db660113b64724e14CEdCD01Ee879)
- [HomeGateway](https://testnet.arbiscan.io/address/0x4d18b9792e0D8F5aF696E71dBEDff8fcBEed6e8C)
- [KlerosCore](https://testnet.arbiscan.io/address/0x5A407DcbD0F83ECbc1894C4B4f8Fc5b699D4822F)
- [SafeBridgeArbitrum](https://testnet.arbiscan.io/address/0x68eE49dfD9d76f3386257a3D0e0A85c0A5519bBD)
- [SortitionSumTreeFactory](https://testnet.arbiscan.io/address/0xf02733d9e5CbfE67B54F165b0277E1995106D526)

## Contributing

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
Currently the scripts support only deploying the HomeChain contracts to the local network.

**Shell 1: the node**

```bash
yarn hardhat node --tags nothing
```

**Shell 2: the deploy script**

```bash
yarn hardhat deploy --network localhost --tags HomeChain
```

#### 2. Deploy to Public Testnets

```bash
# To deploy on L2 only
yarn hardhat deploy --network arbitrumRinkeby --tags HomeChain

# To deploy on L1 only
yarn hardhat deploy --network rinkeby --tags ForeignChain

# To deploy both L1 and L2
yarn deploy:staging
```

The deployed addresses should be output to the screen after the deployment is complete.
If you miss that, you can always go to the `deployments/<network>` directory and look for the respective file.

#### 3. Verify the Source Code for Contracts

This must be done for each network separately.

```bash
yarn hardhat --network <arbitrumRinkeby|arbitrum|rinkeby|mainnet> etherscan-verify
```
