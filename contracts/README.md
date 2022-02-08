# @kleros/kleros-v2-contracts

Smart contracts for Kleros v2

## Deployed Addresses

Refresh the list of deployed contracts by running `scripts/generateDeploymentsMarkdown.sh`.

### Rinkeby

- [FastBridgeReceiver](https://rinkeby.etherscan.io/address/0x300CbF0829762FeDc90287D08aeDf261EE6ED8eB)
- [ForeignGateway](https://rinkeby.etherscan.io/address/0x8F1a2B8F9b04320375856580Fc6B1669Cb12a9EE)

### Arbitrum Rinkeby

- [FastBridgeSender](https://testnet.arbiscan.io/address/0x395014fddc3b12F9a78ED8E57DA162Fd77E12bE3)
- [HomeGateway](https://testnet.arbiscan.io/address/0x300CbF0829762FeDc90287D08aeDf261EE6ED8eB)
- [SafeBridgeArbitrum](https://testnet.arbiscan.io/address/0x014A442480DbAD767b7615E55E271799889FA1a7)

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

#### 2. Deploy to Public Testnets

```bash
yarn deploy:staging # to deploy to L1/L2 testnet
# yarn deploy:production # to deploy to L1/L2 mainnet
```

The deployed addresses should be output to the screen after the deployment is complete.
If you miss that, you can always go to the `deployments/<network>` directory and look for the respective file.

#### 3. Verify the Source Code for Contracts

This must be done for each network separately.

```bash
yarn hardhat --network <arbitrumRinkeby|arbitrum|rinkeby|mainnet> etherscan-verify
```
