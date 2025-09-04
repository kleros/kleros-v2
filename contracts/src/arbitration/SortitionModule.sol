// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {SortitionModuleBase, KlerosCore, IRNG} from "./SortitionModuleBase.sol";

/// @title SortitionModule
/// @dev A factory of trees that keeps track of staked values for sortition.
contract SortitionModule is SortitionModuleBase {
    string public constant override version = "2.0.0";

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _owner The owner.
    /// @param _core The KlerosCore.
    /// @param _minStakingTime Minimal time to stake
    /// @param _maxDrawingTime Time after which the drawing phase can be switched
    /// @param _rng The random number generator.
    function initialize(
        address _owner,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        IRNG _rng
    ) external initializer {
        __SortitionModuleBase_initialize(_owner, _core, _minStakingTime, _maxDrawingTime, _rng);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view virtual override onlyByOwner {
        // NOP
    }
}
