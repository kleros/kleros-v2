// SPDX-License-Identifier: MIT

/**
 *  @custom:authors: [@epiqueras, @unknownunknown1, @jaybuidl, @shotaronowhere]
 *  @custom:reviewers: []
 *  @custom:auditors: []
 *  @custom:bounties: []
 *  @custom:deployments: []
 */

pragma solidity 0.8.24;

import "./SortitionModuleBase.sol";
import "../proxy/UUPSProxiable.sol";
import "../proxy/Initializable.sol";

/// @title SortitionModule
/// @dev A factory of trees that keeps track of staked values for sortition.
contract SortitionModule is SortitionModuleBase, UUPSProxiable, Initializable {
    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _governor The governor.
    /// @param _core The KlerosCore.
    /// @param _minStakingTime Minimal time to stake
    /// @param _maxDrawingTime Time after which the drawing phase can be switched
    /// @param _rng The random number generator.
    function initialize(
        address _governor,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        RNG _rng
    ) external reinitializer(1) {
        super._initialize(_governor, _core, _minStakingTime, _maxDrawingTime, _rng);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view virtual override onlyByGovernor {
        // NOP
    }
}
