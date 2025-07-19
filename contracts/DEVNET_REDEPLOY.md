## Clean up of the old artifacts

The following contracts have been preserved:

- The University contracts (out-of-scope for now)
- The ERC20 tokens and their faucets (unchanged): PinakionV2, PNK, PNKFaucet, DAI, DAIFaucet, WETH, WETHFaucet
- The RNG contracts (unchanged): RandomizerOracle, BlockHashRNG, ChainlinkRNG, ChainlinkVRFCoordinator (mock)
- KlerosV2NeoEarlyUser (unchanged, for Neo devnet)

```shell
rm deployments/arbitrumSepoliaDevnet/DisputeKitClassic.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitClassic_Implementation.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitClassic_Proxy.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitGated_Implementation.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitGated_Proxy.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitGated.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitGatedShutter_Implementation.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitGatedShutter_Proxy.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitGatedShutter.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitShutter.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitShutter_Implementation.json
rm deployments/arbitrumSepoliaDevnet/DisputeKitShutter_Proxy.json
rm deployments/arbitrumSepoliaDevnet/DisputeResolver.json
rm deployments/arbitrumSepoliaDevnet/DisputeResolverRuler.json
rm deployments/arbitrumSepoliaDevnet/DisputeTemplateRegistry.json
rm deployments/arbitrumSepoliaDevnet/DisputeTemplateRegistry_Implementation.json
rm deployments/arbitrumSepoliaDevnet/DisputeTemplateRegistry_Proxy.json
rm deployments/arbitrumSepoliaDevnet/EvidenceModule.json
rm deployments/arbitrumSepoliaDevnet/EvidenceModule_Implementation.json
rm deployments/arbitrumSepoliaDevnet/EvidenceModule_Proxy.json
rm deployments/arbitrumSepoliaDevnet/KlerosCore.json
rm deployments/arbitrumSepoliaDevnet/KlerosCoreRuler.json
rm deployments/arbitrumSepoliaDevnet/KlerosCoreRuler_Implementation.json
rm deployments/arbitrumSepoliaDevnet/KlerosCoreRuler_Proxy.json
rm deployments/arbitrumSepoliaDevnet/KlerosCoreSnapshotProxy.json
rm deployments/arbitrumSepoliaDevnet/KlerosCore_Implementation.json
rm deployments/arbitrumSepoliaDevnet/KlerosCore_Proxy.json
rm deployments/arbitrumSepoliaDevnet/PolicyRegistry.json
rm deployments/arbitrumSepoliaDevnet/PolicyRegistry_Implementation.json
rm deployments/arbitrumSepoliaDevnet/PolicyRegistry_Proxy.json
rm deployments/arbitrumSepoliaDevnet/SortitionModule.json
rm deployments/arbitrumSepoliaDevnet/SortitionModule_Implementation.json
rm deployments/arbitrumSepoliaDevnet/SortitionModule_Proxy.json
```

## Contracts Deployment - DRY RUN

Shell 1: fork node

```shell
anvil --fork-url https://sepolia-rollup.arbitrum.io/rpc
```

Shell 2: deployer

```shell
export ARBITRUM_SEPOLIA_RPC=http://127.0.0.1:8545

yarn clean
yarn deploy --network arbitrumSepoliaDevnet --tags Resolver
yarn deploy --network arbitrumSepoliaDevnet --tags ArbitrationRuler

unset ARBITRUM_SEPOLIA_RPC
```

:warning: Remember to delete all the deployed artifacts after each dry run.

## Contracts Deployment - LIVE

```shell
yarn clean
yarn deploy --network arbitrumSepoliaDevnet --tags Resolver
yarn deploy --network arbitrumSepoliaDevnet --tags ArbitrationRuler

# Contracts verification, marking proxies
yarn etherscan-verify --network arbitrumSepoliaDevnet
yarn etherscan-verify-proxies

# Docs update
./scripts/populateReadme.sh
```

## Courts structure and policies configuration

```shell
yarn hardhat populate:courts --from v2_devnet --network arbitrumSepoliaDevnet

yarn hardhat populate:policy-registry --from v2_devnet --network arbitrumSepoliaDevnet
```

## Contracts SDK

### Refresh the artifacts

```shell
# Viem artifacts
yarn viem:generate-devnet

# Hardhat artifacts
yarn export:devnet
```

### Update the contract helpers

If there are new or removed contracts, edit the contract helpers in:

- `scripts/utils/contracts.ts` (Hardhat runtime)
- `deployments/contractsEthers.ts` (pure EthersJS)
- `deployments/contractsViem.ts` (pure Viem)
