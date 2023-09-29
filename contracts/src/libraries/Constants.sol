// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

/// @title Constants
library Constants {
    // Courts
    uint96 public constant FORKING_COURT = 0; // Index of the forking court.
    uint96 public constant GENERAL_COURT = 1; // Index of the default (general) court.

    // Dispute Kits
    uint256 public constant NULL_DISPUTE_KIT = 0; // Null pattern to indicate a top-level DK which has no parent.
    uint256 public constant DISPUTE_KIT_CLASSIC = 1; // Index of the default DK. 0 index is skipped.

    // Defaults
    uint256 public constant DEFAULT_NB_OF_JURORS = 3; // The default number of jurors in a dispute.
}
