// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {SortitionSumTreeBase} from "./SortitionSumTreeBase.sol";
import {IStakeController} from "./interfaces/IStakeController.sol";

/// @title SortitionSumTree
/// @notice Basic implementation of the pure sortition module
/// @dev Contains only tree management and drawing logic, no phase management or token operations
contract SortitionSumTree is SortitionSumTreeBase {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _governor The governor's address.
    /// @param _stakeController The StakeController contract.
    function initialize(address _governor, IStakeController _stakeController) external initializer {
        __SortitionSumTreeBase_initialize(_governor, _stakeController);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }
}
