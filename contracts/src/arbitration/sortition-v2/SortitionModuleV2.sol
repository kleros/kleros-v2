// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {SortitionModuleV2Base} from "./SortitionModuleV2Base.sol";
import {IStakeController} from "../interfaces/IStakeController.sol";
import {KlerosCore} from "../KlerosCore.sol";

/// @title SortitionModuleV2
/// @notice Basic implementation of the pure sortition module
/// @dev Contains only tree management and drawing logic, no phase management or token operations
contract SortitionModuleV2 is SortitionModuleV2Base {
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
        __SortitionModuleV2Base_initialize(_governor, _stakeController);
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
