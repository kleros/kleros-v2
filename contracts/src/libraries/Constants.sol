// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Courts
uint96 constant FORKING_COURT = 0; // Index of the forking court.
uint96 constant GENERAL_COURT = 1; // Index of the default (general) court.

// Dispute Kits
uint256 constant NULL_DISPUTE_KIT = 0; // Null pattern to indicate a top-level DK which has no parent. DEPRECATED, as its main purpose was to accommodate forest structure which is not used now.
uint256 constant DISPUTE_KIT_CLASSIC = 1; // Index of the default DK. 0 index is skipped.

// Sortition Module
uint256 constant MAX_STAKE_PATHS = 4; // The maximum number of stake paths a juror can have.
uint256 constant DEFAULT_K = 6; // Default number of children per node.

// Defaults
uint256 constant DEFAULT_NB_OF_JURORS = 3; // The default number of jurors in a dispute.
IERC20 constant NATIVE_CURRENCY = IERC20(address(0)); // The native currency, such as ETH on Arbitrum, Optimism and Ethereum L1.

// DEPRECATED
enum OnError {
    Revert,
    Return
}

enum StakingResult {
    Successful,
    Delayed,
    StakingTransferFailed, // DEPRECATED
    UnstakingTransferFailed, // DEPRECATED
    CannotStakeInMoreCourts, // DEPRECATED
    CannotStakeInThisCourt, // DEPRECATED
    CannotStakeLessThanMinStake, // DEPRECATED
    CannotStakeMoreThanMaxStakePerJuror, // DEPRECATED
    CannotStakeMoreThanMaxTotalStaked, // DEPRECATED
    CannotStakeZeroWhenNoStake // DEPRECATED
}
