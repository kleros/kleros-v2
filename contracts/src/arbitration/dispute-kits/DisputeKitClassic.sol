// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DisputeKitClassicBase, KlerosCore} from "./DisputeKitClassicBase.sol";

/// @title DisputeKitClassic
/// Dispute kit implementation of the Kleros v1 features including:
/// - a drawing system: proportional to staked PNK,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitClassic is DisputeKitClassicBase {
    string public constant override version = "0.12.0";

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer.
    /// @param _owner The owner's address.
    /// @param _core The KlerosCore arbitrator.
    /// @param _wNative The wrapped native token address, typically wETH.
    function initialize(address _owner, KlerosCore _core, address _wNative) external reinitializer(1) {
        __DisputeKitClassicBase_initialize(_owner, _core, _wNative);
    }

    function reinitialize(address _wNative) external reinitializer(9) {
        wNative = _wNative;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }
}
