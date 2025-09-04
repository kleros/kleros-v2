# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/).

## [0.13.0] - 2025-08-07 (Not published yet)

### Changed

- **Breaking:** Stake the juror's PNK rewards instead of transferring them out ([#2099](https://github.com/kleros/kleros-v2/issues/2099))
- **Breaking:** Replace `require()` with `revert()` and custom errors outside KlerosCore for consistency and smaller bytecode ([#2084](https://github.com/kleros/kleros-v2/issues/2084))
- **Breaking:** Rename the interface from `RNG` to `IRNG` ([#2054](https://github.com/kleros/kleros-v2/issues/2054))
- **Breaking:** Remove the `_block` parameter from `IRNG.requestRandomness()` and `IRNG.receiveRandomness()`, not needed for the primary VRF-based RNG ([#2054](https://github.com/kleros/kleros-v2/issues/2054))
- **Breaking:** Rename `governor` to `owner` in order to comply with the lightweight ownership standard [ERC-5313](https://eipsinsight.com/ercs/erc-5313) ([#2112](https://github.com/kleros/kleros-v2/issues/2112))
- **Breaking:** Apply the penalties to the stakes in the Sortition Tree ([#2107](https://github.com/kleros/kleros-v2/issues/2107))
- **Breaking:** Make `SortitionModule.getJurorBalance().stakedInCourt` include the penalties ([#2107](https://github.com/kleros/kleros-v2/issues/2107))
- Make `IDisputeKit.draw()` and `ISortitionModule.draw()` return the court ID from which the juror was drawn ([#2107](https://github.com/kleros/kleros-v2/issues/2107))
- Rename `SortitionModule.setJurorInactive()` to `SortitionModule.forcedUnstakeAllCourts()` ([#2107](https://github.com/kleros/kleros-v2/issues/2107))
- Make the primary VRF-based RNG fall back to `BlockhashRNG` if the VRF request is not fulfilled within a timeout ([#2054](https://github.com/kleros/kleros-v2/issues/2054))
- Authenticate the calls to the RNGs to prevent 3rd parties from depleting the Chainlink VRF subscription funds ([#2054](https://github.com/kleros/kleros-v2/issues/2054))
- Use `block.timestamp` rather than `block.number` for `BlockhashRNG` for better reliability on Arbitrum as block production is sporadic depending on network conditions. ([#2054](https://github.com/kleros/kleros-v2/issues/2054))
- Replace the `bytes32 _key` parameter in `SortitionTrees.createTree()` and `SortitionTrees.draw()` by `uint96 courtID` ([#2113](https://github.com/kleros/kleros-v2/issues/2113))
- Extract the sortition sum trees logic into a library `SortitionTrees` ([#2113](https://github.com/kleros/kleros-v2/issues/2113))
- Make `IDisputeKit.getDegreeOfCoherenceReward()` multi-dimensional so different calculations may be applied to PNK rewards, fee rewards and PNK penalties (future-proofing) ([#2090](https://github.com/kleros/kleros-v2/issues/2090))
- Consolidate the constant `ALPHA_DIVISOR` with `ONE_BASIS_POINTS` ([#2090](https://github.com/kleros/kleros-v2/issues/2090))
- Set the Hardhat Solidity version to v0.8.30 and enable the IR pipeline ([#2069](https://github.com/kleros/kleros-v2/issues/2069))
- Set the Foundry Solidity version to v0.8.30 and enable the IR pipeline ([#2073](https://github.com/kleros/kleros-v2/issues/2073))
- Widen the allowed solc version to any v0.8.x for the interfaces only ([#2083](https://github.com/kleros/kleros-v2/issues/2083))
- Bump `hardhat` to v2.26.2 ([#2069](https://github.com/kleros/kleros-v2/issues/2069))
- Bump `@kleros/vea-contracts` to v0.7.0 ([#2073](https://github.com/kleros/kleros-v2/issues/2073))

### Added

- **Breaking:** Add a new field `drawnJurorFromCourtIDs` to the `Round` struct in `KlerosCoreBase` and `KlerosCoreUniversity` ([#2107](https://github.com/kleros/kleros-v2/issues/2107))
- **Breaking:** Add a new state variable `jumpDisputeKitID` to the `DisputeKitClassicBase` contract ([#2114](https://github.com/kleros/kleros-v2/issues/2114))
- **Breaking:** Add a parameter `_recoveryCommit` to the event `DisputeKitShutter.CommitCastShutter` ([#2100](https://github.com/kleros/kleros-v2/issues/2100))
- **Breaking:** Add a storage variable `recoveryCommitments` to `DisputeKitShutter` ([#2100](https://github.com/kleros/kleros-v2/issues/2100))
- Allow the Shutter commitment to be recovered by the juror using only the salt and the choice, without having to provide the justification ([#2100](https://github.com/kleros/kleros-v2/issues/2100))
- Allow the dispute kits to force an early court jump and to override the number of votes after an appeal (future-proofing) ([#2110](https://github.com/kleros/kleros-v2/issues/2110))
- Allow the dispute kits to specify which new dispute kit to use when a court jump occurs ([#2114](https://github.com/kleros/kleros-v2/issues/2114))
- Allow stake changes to by-pass delayed stakes when initiated by the SortitionModule by setting the `_noDelay` parameter to `true` in `SortitionModule.validateStake()` ([#2107](https://github.com/kleros/kleros-v2/issues/2107))

### Fixed

- Do not pass to Voting period if all the commits are cast because it breaks the current Shutter auto-reveal process. ([#2085](https://github.com/kleros/kleros-v2/issues/2085))

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

[0.13.0]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.13.0
[0.12.0]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.12.0
[0.11.0]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.11.0
[0.10.0]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.10.0
[0.9.4]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.9.4
[0.9.3]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.9.3
[0.8.1]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@0.8.1
