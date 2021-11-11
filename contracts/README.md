# @kleros/kleros-v2-contracts

Smart contracts for Kleros v2

## Deployed Addresses

### Contract 1

- Mainnet: ...
- Testnet: ...

### Contract 2

...

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

- `PRIVATE_KEY`: the private key of the deployer account used for xDAI, Sokol and Kovan.
- `MAINNET_PRIVATE_KEY`: the private key of the deployer account used for Mainnet.
- `INFURA_API_KEY`: the API key for infura.

The ones below are optional:

- `ETHERSCAN_API_KEY`: used only if you wish to verify the source of the newly deployed contracts on Etherscan.

#### 1. Update the Constructor Parameters (optional)

If some of the constructor parameters (such as the Meta Evidence) needs to change, you need to update the files in the `deploy/` directory.

#### 2. Deploy the Proxies

```bash
yarn deploy:staging # to deploy to L1/L2 testnet
# yarn deploy:production # to deploy to L1/L2 mainnet
```

The deployed addresses should be output to the screen after the deployment is complete.
If you miss that, you can always go to the `deployments/<network>` directory and look for the respective file.

#### 3. Verify the Source Code for Contracts

This must be done for each network separately.

For `Kovan` or `Mainnet` you can use the `etherscan-verify` command from `hardhat`:

```bash
yarn hardhat --network <kovan|mainnet> etherscan-verify
```

For `Sokol` and `xDAI` the process currently must be done manually through [Blockscout](https://blockscout.com/).
