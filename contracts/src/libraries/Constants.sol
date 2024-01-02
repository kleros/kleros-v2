// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Constants
library Constants {
    // Courts
    uint96 internal constant FORKING_COURT = 0; // Index of the forking court.
    uint96 internal constant GENERAL_COURT = 1; // Index of the default (general) court.

    // Dispute Kits
    uint256 internal constant NULL_DISPUTE_KIT = 0; // Null pattern to indicate a top-level DK which has no parent.
    uint256 internal constant DISPUTE_KIT_CLASSIC = 1; // Index of the default DK. 0 index is skipped.

    // Defaults
    uint256 internal constant DEFAULT_NB_OF_JURORS = 3; // The default number of jurors in a dispute.
    IERC20 internal constant NATIVE_CURRENCY = IERC20(address(0)); // The native currency, such as ETH on Arbitrum, Optimism and Ethereum L1.
}
