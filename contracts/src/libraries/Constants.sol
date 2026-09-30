// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICourtEligibility} from "../arbitration/interfaces/ICourtEligibility.sol";

// Courts
uint96 constant FINAL_COURT = 0; // Index of the final court.
uint96 constant GENERAL_COURT = 1; // Index of the default (general) court.

// Dispute Kits
uint256 constant FINAL_DISPUTE_KIT = 0; // Index of the final DK.
uint256 constant DISPUTE_KIT_CLASSIC = 1; // Index of the default DK.

// Sortition Module
uint256 constant MAX_STAKE_PATHS = 4; // The maximum number of stake paths a juror can have.
uint256 constant DEFAULT_K = 6; // Default number of children per node.

// Defaults
uint256 constant DEFAULT_NB_OF_JURORS = 3; // The default number of jurors in a dispute.
ICourtEligibility constant NULL_ELIGIBILITY_REQUIREMENT = ICourtEligibility(address(0)); // Null pattern to indicate the absence of an eligibility requirement for the court.

// Units
uint256 constant ONE_BASIS_POINT = 10000; // 1 in basis points.
