# Changelog

All notable changes to this package will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/).

## [2.0.0-rc.2] - 2026-02-18

### Changed

- **Breaking:** Add `executed` status to `KlerosCore` disputes to prevent re-execution ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- **Breaking:** Store `timesPerPeriod`, `hiddenVotes`, and `jurorsForCourtJump` in `KlerosCore.Round` struct instead of reading from court at execution time ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- **Breaking:** Extract rates conversion logic into external `RatesConverter` contract with `IRatesConverter` interface ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- **Breaking:** Add court-specific token gate whitelist to `DisputeKitGated` and `DisputeKitGatedShutter` ([#2209](https://github.com/kleros/kleros-v2/pull/2209))

### Added

- **Breaking:** Add staking eligibility per court via new `ICourtEligibility` interface ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- **Breaking:** Add arbitration pause mechanism with grace period to `KlerosCore` and `DisputeKitClassicBase` ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- Add `LeaderboardOffset` contract for juror coherence offset tracking ([#2198](https://github.com/kleros/kleros-v2/pull/2198), [`3f18fc6`](https://github.com/kleros/kleros-v2/commit/3f18fc6b))
- Add `SBT` soulbound token contract ([#2220](https://github.com/kleros/kleros-v2/pull/2220))
- Restore `increaseAllowance()` and `decreaseAllowance()` to `PinakionV2` lost in OpenZeppelin v5 upgrade ([#2220](https://github.com/kleros/kleros-v2/pull/2220))

### Fixed

- Fix stakes accounting corruption when juror is drawn during delayed stake processing ([#2225](https://github.com/kleros/kleros-v2/pull/2225), [#2209](https://github.com/kleros/kleros-v2/pull/2209))
- Fix `SafeERC20` to check return value of `safeTransfer` ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- Fix `maxStakePerJuror` bypass in `SortitionModule` ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- Fix coherence calculation for tied choices in `DisputeKitClassicBase` ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- Guard `KlerosCore` against malicious arbitrable contracts that manipulate state during ruling execution ([#2209](https://github.com/kleros/kleros-v2/pull/2209))
- Standardize null court eligibility sentinel value across all contracts ([#2212](https://github.com/kleros/kleros-v2/pull/2212))

## [2.0.0-rc.1] - 2025-11-05

Initial version.

[2.0.0-rc.1]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@2.0.0-rc.1
[2.0.0-rc.2]: https://github.com/kleros/kleros-v2/releases/tag/@kleros%2Fkleros-v2-contracts@2.0.0-rc.2
