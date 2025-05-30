// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";

/// @title DisputeKitClassic
/// Dispute kit implementation of the Kleros v1 features including:
/// - a drawing system: proportional to staked PNK,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitClassic is DisputeKitClassicBase {
    string public constant override version = "0.11.0";

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer.
    /// @param _governor The governor's address.
    /// @param _core The KlerosCore arbitrator.
    function initialize(address _governor, KlerosCore _core) external reinitializer(1) {
        __DisputeKitClassicBase_initialize(_governor, _core);
    }

    function initialize7() external reinitializer(7) {
        // NOP
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }
}
