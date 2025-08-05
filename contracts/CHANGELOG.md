# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/).

## [0.12.0] - 2025-08-05

### Changed

- **Breaking:** Make `viem` a peer dependency, it should be provided by the consuming package ([`4594536`](https://github.com/kleros/kleros-v2/commit/4594536c))

### Added

- Add helper function `getDisputeKitsViem` to retrieve a deployment's available dispute kit infos including their capabilities (`isShutter`, `isGated`) ([`5a81f9e`](https://github.com/kleros/kleros-v2/commit/5a81f9ec))

## [0.11.0] - 2025-08-02

### Changed

- **Breaking:** Add an extra wNative parameter to the initializer of `KlerosCoreBase` and `DisputeKitBase` and their descendants ([#2041](https://github.com/kleros/kleros-v2/issues/2041))
- **Breaking:** Add an extra wNative parameter to the constructor of `KlerosGovernor` ([#2041](https://github.com/kleros/kleros-v2/issues/2041))
- **Breaking:** Upgrade Mainnet Beta to v0.11.0 ([`ea9dcc95`](https://github.com/kleros/kleros-v2/commit/ea9dcc95))
- **Breaking:** Upgrade Devnet and Testnet to v0.11.0 ([`b9e847d`](https://github.com/kleros/kleros-v2/commit/b9e847d9))
- Fallback to sending wETH if sending ETH fails ([#2041](https://github.com/kleros/kleros-v2/issues/2041))
- Automate `SortitionModule.withdrawLeftoverPNK()` using the keeper bot ([`97ba58a`](https://github.com/kleros/kleros-v2/commit/97ba58a))
- Upgrade Testnet to v0.10.0 ([#2058](https://github.com/kleros/kleros-v2/issues/2058))
- Support the Gated and Shutter Gated dispute kits by the keeper bot ([`026fe83`](https://github.com/kleros/kleros-v2/commit/026fe83))
- Support the Gated and Shutter Gated dispute kits by the contracts getter tests ([`2166ee0`](https://github.com/kleros/kleros-v2/commit/2166ee0))
- Draw jurors with a more number of iterations to account for ineligible jurors by the keeper bot ([`6eb5bc6`](https://github.com/kleros/kleros-v2/commit/6eb5bc6))
- Bump `@shutter-network/shutter-sdk` to 0.0.2 ([#2049](https://github.com/kleros/kleros-v2/issues/2049))

### Added

- **Breaking:** Add new dispute kits to Mainnet Beta: Shutter, Gated, Gated Shutter ([`ea9dcc95`](https://github.com/kleros/kleros-v2/commit/ea9dcc95))
- **Breaking:** Add new dispute kits to Testnet: Shutter, Gated, Gated Shutter ([`b9e847d`](https://github.com/kleros/kleros-v2/commit/b9e847d9))

### Fixed

- Do not push address(0) in `DisputeKitBase.round.votes` during `draw()` when there is no staked juror in the court ([#2059](https://github.com/kleros/kleros-v2/issues/2059))
- Reduce Neo core contract size below limit by 144 bytes by extracting internal functions for repeated code and by making the `appealPeriod()` view external. ([`4a84534`](https://github.com/kleros/kleros-v2/commit/4a845346))

## [0.10.0] - 2025-07-20

### Changed

- **Breaking:** Redeploy the Devnet contracts ([`b8a2a15`](https://github.com/kleros/kleros-v2/commit/b8a2a15))
- **Breaking:** Update the Devnet contract artifacts, add getter for the new Shutter, Gated and Gated Shutter dispute kits ([`5ef5f23`](https://github.com/kleros/kleros-v2/commit/5ef5f23))
- **Breaking**: Make `KlerosCoreBase.draw()` return the number of drawn jurors ([`54d83a7`](https://github.com/kleros/kleros-v2/commit/54d83a7))
- **Breaking**: Make `SortitionModule.penalizeStake()` return `(uint256 pnkBalance, uint256 availablePenalty)` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- **Breaking**: Split SortitionModuleBase.setStake() into 2 functions: `validateStake()` and `setStake()` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Avoid unnecessary calls `KlerosCoreBase.draw()` by the keeper bot when no juror is available ([`54d83a7`](https://github.com/kleros/kleros-v2/commit/54d83a7))
- Migrate the contracts verification tooling to the etherscan v2 API ([`b8a2a15`](https://github.com/kleros/kleros-v2/commit/b8a2a15))
- Bump contract Solidity version to v0.8.28 ([`6e535cc`](https://github.com/kleros/kleros-v2/commit/6e535cc))
- Bump contract dependencies, `hardhat` to v2.26.0 `node` to v20, `yarn` to 4.9.2 ([`6e535cc`](https://github.com/kleros/kleros-v2/commit/6e535cc))
- Deprecate struct field `SortitionModuleBase.SortitionSumTree.alreadyTransferred` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Deprecate state variable `SortitionModuleBase.latestDelayedStakeIndex` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))

### Added

- Add Gated dispute kit with support a dynamic token address for the Gated dispute kit using the dispute `extraData` ([#2045](https://github.com/kleros/kleros-v2/issues/2045))
- Add Shutter Gated dispute kit ([#2045](https://github.com/kleros/kleros-v2/issues/2045))
- Add public functions to `SortitionModuleBase` `getJurorLeftoverPNK(address _juror)` and `withdrawLeftoverPNK(address _account)` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Add a permissioned function to KlerosCoreBase `transferBySortitionModule(address _account, uint256 _amount)`
- Add a public boolean `DisputeKitBase.coreDisputeIDToActive` keyed by `coreDisputeID` ([#2039](https://github.com/kleros/kleros-v2/issues/2039))
- Support for the Shutter API token by the keeper bot using the environment variable `SHUTTER_API_KEY` ([`f999611`](https://github.com/kleros/kleros-v2/commit/f999611))

### Removed

- Remove instant staking logic ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Remove the parameter `_alreadyTransferred` to the staking functions. No external interfaces impact. ([#2004](https://github.com/kleros/kleros-v2/issues/2004))

### Fixed

- Do not prevent a juror from being drawn if their entire stake is already locked ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Prevent stake corruption when delayed stakes move existing stakes to another court and juror is drawn ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Ensure that a dispute does belong to the right dispute kit ([#2039](https://github.com/kleros/kleros-v2/issues/2039))
- Reset `dispute.jumped` in dispute kit `createDispute()` ([#2039](https://github.com/kleros/kleros-v2/issues/2039))

## [0.9.4] - 2025-06-23

### Changed

- Upgrade the Beta contracts ([`a72c450`](https://github.com/kleros/kleros-v2/commit/a72c450))
- Upgrade the Testnet contracts ([`05c5b3d`](https://github.com/kleros/kleros-v2/commit/05c5b3d))
- Upgrade the Devnet contracts ([`019cfd9`](https://github.com/kleros/kleros-v2/commit/019cfd9))

### Added

- Add a view function `KlerosCoreBase.getPnkAtStakePerJuror(uint256 _disputeID, uint256 _round)`
- Add a public boolean `DisputeKitBase.alreadyDrawn` keyed by `localDisputeID`, `localRoundID` and `drawnAddress`

### Fixed

- Stop calling `getRoundInfo()` from the mutating function `DisputeKitBase._postDrawCheck()` ([`524a2dc`](https://github.com/kleros/kleros-v2/commit/524a2dc))
- Restore the broken dispute kit storage layout on Testnet ([`1d2e62a`](https://github.com/kleros/kleros-v2/commit/1d2e62a))
- Fix a typo in SafeERC20.sol ([#1960](https://github.com/kleros/kleros-v2/issues/1960))

### Uncategorized

## [0.9.3] - 2025-04-18

### Changed

- **Breaking change**: Bundle the package for both CJS and ESM, it changes the package entry point ([`c132303`](https://github.com/kleros/kleros-v2/commit/c132303))
- Pass the commit and appeal periods quicker when possible ([#1955](https://github.com/kleros/kleros-v2/issues/1955))

### Added

- Add contracts getter for Viem ([`1aeb0a2`](https://github.com/kleros/kleros-v2/commit/1aeb0a2))
- Add contract getter for EtherJS, export deployment files ([`692c83f`](https://github.com/kleros/kleros-v2/commit/692c83f))
- New DisputeKitBase view function `isAppealFunded()` ([#1955](https://github.com/kleros/kleros-v2/issues/1955))

### Fixed

- Fix typo in custom error `StakingNotPossibleInThisCourt` ([#1956](https://github.com/kleros/kleros-v2/issues/1956))

## [0.8.1] - 2025-04-10

[0.12.0]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.12.0
[0.11.0]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.11.0
[0.10.0]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.10.0
[0.9.4]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.9.4
[0.9.3]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.9.3
[0.8.1]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.8.1
