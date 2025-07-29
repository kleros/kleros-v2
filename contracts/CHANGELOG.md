# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/).

## [0.10.1] - 2025-07-29

### Changed

- Automate `SortitionModule.withdrawLeftoverPNK()` using the keeper bot ([`97ba58a`](https://github.com/kleros/kleros-v2/commit/97ba58a)) (jaybuidl)
- Upgrade Testnet ([#2058](https://github.com/kleros/kleros-v2/issues/2058)) (jaybuidl)
- Support the Gated and Shutter Gated dispute kits by the keeper bot ([`026fe83`](https://github.com/kleros/kleros-v2/commit/026fe83)) (jaybuidl)
- Support the Gated and Shutter Gated dispute kits by the contracts getter tests ([`2166ee0`](https://github.com/kleros/kleros-v2/commit/2166ee0)) (jaybuidl)
- Draw jurors with a more number of iterations to account for ineligible jurors by the keeper bot ([`6eb5bc6`](https://github.com/kleros/kleros-v2/commit/6eb5bc6)) (jaybuidl)
- Bump `@shutter-network/shutter-sdk` to 0.0.2 ([#2049](https://github.com/kleros/kleros-v2/issues/2049)) (jaybuidl)

## [0.10.0] - 2025-07-20

### Changed

- **Breaking:** Redeploy the Devnet contracts ([`b8a2a15`](https://github.com/kleros/kleros-v2/commit/b8a2a15)) (jaybuidl)
- **Breaking:** Update the Devnet contract artifacts, add getter for the new Shutter, Gated and Gated Shutter dispute kits ([`5ef5f23`](https://github.com/kleros/kleros-v2/commit/5ef5f23)) (jaybuidl)
- **Breaking**: Make `KlerosCoreBase.draw()` return the number of drawn jurors ([`54d83a7`](https://github.com/kleros/kleros-v2/commit/54d83a7))
- **Breaking**: Make `SortitionModule.penalizeStake()` return `(uint256 pnkBalance, uint256 availablePenalty)` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- **Breaking**: Split SortitionModuleBase.setStake() into 2 functions: validateStake() and setStake() ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Avoid unnecessary calls `KlerosCoreBase.draw()` by the keeper bot when no juror is available ([`54d83a7`](https://github.com/kleros/kleros-v2/commit/54d83a7))
- Migrate the contracts verification tooling to the etherscan v2 API ([`b8a2a15`](https://github.com/kleros/kleros-v2/commit/b8a2a15)) (jaybuidl)
- Bump contract Solidity version to v0.8.28 ([`6e535cc`](https://github.com/kleros/kleros-v2/commit/6e535cc)) (jaybuidl)
- Bump contract dependencies, `hardhat` to v2.26.0 `node` to v20, `yarn` to 4.9.2 ([`6e535cc`](https://github.com/kleros/kleros-v2/commit/6e535cc)) (jaybuidl)
- Deprecate struct field `SortitionModuleBase.SortitionSumTree.alreadyTransferred` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Deprecate state variable `SortitionModuleBase.latestDelayedStakeIndex` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))

### Added

- Add Gated dispute kit with support a dynamic token address for the Gated dispute kit using the dispute `extraData` ([#2045](https://github.com/kleros/kleros-v2/issues/2045)) (jaybuidl)
- Add Shutter Gated dispute kit ([#2045](https://github.com/kleros/kleros-v2/issues/2045)) (jaybuidl)
- Add public functions to `SortitionModuleBase` `getJurorLeftoverPNK(address _juror)` and `withdrawLeftoverPNK(address _account)` ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Add a permissioned function to KlerosCoreBase `transferBySortitionModule(address _account, uint256 _amount)`
- Add a public boolean `DisputeKitBase.coreDisputeIDToActive` keyed by `coreDisputeID` ([#2039](https://github.com/kleros/kleros-v2/issues/2039)) (unknownunknown1)
- Support for the Shutter API token by the keeper bot using the environment variable `SHUTTER_API_KEY` ([`f999611`](https://github.com/kleros/kleros-v2/commit/f999611)) (jaybuidl)

### Removed

- Remove instant staking logic ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Remove the parameter `_alreadyTransferred` to the staking functions. No external interfaces impact. ([#2004](https://github.com/kleros/kleros-v2/issues/2004))

### Fixed

- Do not prevent a juror from being drawn if their entire stake is already locked ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Prevent stake corruption when delayed stakes move existing stakes to another court and juror is drawn ([#2004](https://github.com/kleros/kleros-v2/issues/2004))
- Ensure that a dispute does belong to the right dispute kit ([#2039](https://github.com/kleros/kleros-v2/issues/2039)) (unknownunknown1)
- Reset `dispute.jumped` in dispute kit `createDispute()` ([#2039](https://github.com/kleros/kleros-v2/issues/2039)) (jaybuidl)

## [0.9.4] - 2025-06-23

### Changed

- Upgrade the Beta contracts ([`a72c450`](https://github.com/kleros/kleros-v2/commit/a72c450)) (jaybuidl)
- Upgrade the Testnet contracts ([`05c5b3d`](https://github.com/kleros/kleros-v2/commit/05c5b3d)) (jaybuidl)
- Upgrade the Devnet contracts ([`019cfd9`](https://github.com/kleros/kleros-v2/commit/019cfd9)) (jaybuidl)

### Added

- Add a view function `KlerosCoreBase.getPnkAtStakePerJuror(uint256 _disputeID, uint256 _round)`
- Add a public boolean `DisputeKitBase.alreadyDrawn` keyed by `localDisputeID`, `localRoundID` and `drawnAddress`

### Fixed

- Stop calling `getRoundInfo()` from the mutating function `DisputeKitBase._postDrawCheck()` ([`524a2dc`](https://github.com/kleros/kleros-v2/commit/524a2dc)) (jaybuidl)
- Restore the broken dispute kit storage layout on Testnet ([`1d2e62a`](https://github.com/kleros/kleros-v2/commit/1d2e62a)) (jaybuidl)
- Fix a typo in SafeERC20.sol ([#1960](https://github.com/kleros/kleros-v2/issues/1960)) (leopardracer)

### Uncategorized

## [0.9.3] - 2025-04-18

### Changed

- **Breaking change**: Bundle the package for both CJS and ESM, it changes the package entry point ([`c132303`](https://github.com/kleros/kleros-v2/commit/c132303)) (jaybuidl)
- Pass the commit and appeal periods quicker when possible ([#1955](https://github.com/kleros/kleros-v2/issues/1955))

### Added

- Add contracts getter for Viem ([`1aeb0a2`](https://github.com/kleros/kleros-v2/commit/1aeb0a2)) (jaybuidl)
- Add contract getter for EtherJS, export deployment files ([`692c83f`](https://github.com/kleros/kleros-v2/commit/692c83f)) (jaybuidl)
- New DisputeKitBase view function `isAppealFunded()` ([#1955](https://github.com/kleros/kleros-v2/issues/1955))

### Fixed

- Fix typo in custom error `StakingNotPossibleInThisCourt` ([#1956](https://github.com/kleros/kleros-v2/issues/1956)) (jaybuidl)

## [0.8.1] - 2025-04-10

[0.10.1]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.10.1
[0.10.0]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.10.0
[0.9.4]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.9.4
[0.9.3]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.9.3
[0.8.1]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.8.1
