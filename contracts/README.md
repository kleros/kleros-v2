# @kleros/kleros-v2-contracts

Smart contracts for Kleros v2

## Deployed Addresses

Refresh the list of deployed contracts by running `./scripts/generateDeploymentsMarkdown.sh`.

### v2-prealpha-3

#### Arbitrum Rinkeby

- [PNK](https://testnet.arbiscan.io/token/0x364530164a2338cdba211f72c1438eb811b5c639)
- [DisputeKitClassic](https://testnet.arbiscan.io/address/0x6b9268082415b5499175849E46AaE4EDf819916F)
- [DisputeResolver](https://testnet.arbiscan.io/address/0x9cE885713c7459d571593e2793cd2b258B018995)
- [IncrementalNG](https://testnet.arbiscan.io/address/0x078dAd05373d19d7fd6829735b765F12242a4300)
- [KlerosCore](https://testnet.arbiscan.io/address/0x140Cae40BD7eEF075e15c30CF84d1EAa0F4932b8)
- [SortitionSumTreeFactory](https://testnet.arbiscan.io/address/0x48ce286978C74c288eA6Bc9a536BcC899DF8D177)

### v2-prealpha-1

#### Rinkeby

- [PNK](https://rinkeby.etherscan.io/token/0x14aba1fa8a31a8649e8098ad067b739cc5708f30)
- [ArbitrableExample](https://rinkeby.etherscan.io/address/0xf2a59723c5d625D646668E0B615B5764c3F81540)
- [FastBridgeReceiver](https://rinkeby.etherscan.io/address/0xD78DCddE2C5a2Bd4BB246Bc7dB6994b95f7c442C)
- [ForeignGateway](https://rinkeby.etherscan.io/address/0xf02733d9e5CbfE67B54F165b0277E1995106D526)

#### Arbitrum Rinkeby

- [PNK](https://testnet.arbiscan.io/token/0x364530164a2338cdba211f72c1438eb811b5c639)
- [ConstantNG](https://testnet.arbiscan.io/address/0x4401A368dea8D5761AEEFfd3c4a674086dea0666)
- [DisputeKitClassic](https://testnet.arbiscan.io/address/0xed12799915180a257985631fbD2ead261eD838cf)
- [FastBridgeSender](https://testnet.arbiscan.io/address/0x0b9e03455Fed83f209Fa7ce596c93ba6aBAd1f46)
- [HomeGateway](https://testnet.arbiscan.io/address/0x2Aa1f82d363f79c1E7a4CcF955Fb7E4306b9B260)
- [IncrementalNG](https://testnet.arbiscan.io/address/0x95Ad12eF4B5baF332aa46d1EaE9922066Fd6fE4A)
- [KlerosCore](https://testnet.arbiscan.io/address/0xd08452AEE7ab5bE3BF6733BA0d3F0CFdaf060Aa2)
- [SafeBridgeArbitrum](https://testnet.arbiscan.io/address/0x1406bC99873d16Cde3491F809f1Af9442cb5A338)
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

**Shell 1: the node**

```bash
yarn hardhat node --tags nothing
```

**Shell 2: the deploy script**

```bash
yarn hardhat deploy --network localhost --tags HomeChain
```

#### 3. Deploy to Public Testnets

```bash
yarn hardhat deploy --network arbitrumRinkeby --tags Arbitration
yarn hardhat deploy --network rinkeby --tags ForeignChain
yarn hardhat deploy --network arbitrumRinkeby --tags HomeChain
```

The deployed addresses should be output to the screen after the deployment is complete.
If you miss that, you can always go to the `deployments/<network>` directory and look for the respective file.

#### Running Test Fixtures

**Shell 1: the node**

```bash
yarn hardhat node --tags Arbitration,ForeignGateway,HomeGateway
```

**Shell 2: the test script**

```bash
yarn hardhat test --network localhost test/pre-alpha1/index.ts
```

#### 4. Verify the Source Code for Contracts

This must be done for each network separately.

```bash
yarn hardhat --network <arbitrumRinkeby|arbitrum|rinkeby|mainnet> etherscan-verify
```
