// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {StakeControllerBase, IVault} from "./StakeControllerBase.sol";
import {ISortitionModuleV2} from "../interfaces/ISortitionModuleV2.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {KlerosCoreV2Base} from "../core-v2/KlerosCoreV2Base.sol";
import {RNG} from "../../rng/RNG.sol";

/// @title StakeControllerNeo
/// @notice ??
/// @dev Coordinates between Vault and SortitionModule
contract StakeControllerNeo is StakeControllerBase {
    string public constant override version = "1.0.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    // no storage

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Initializer (constructor equivalent for upgradable contracts).
    /// @param _governor The governor's address.
    /// @param _core The KlerosCore contract.
    /// @param _vault The Vault contract.
    /// @param _sortitionModule The SortitionModule contract.
    /// @param _minStakingTime The minimum staking time.
    /// @param _maxDrawingTime The maximum drawing time.
    /// @param _rng The random number generator.
    /// @param _rngLookahead The RNG lookahead time.
    function initialize(
        address _governor,
        KlerosCoreV2Base _core,
        IVault _vault,
        ISortitionModuleV2 _sortitionModule,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        RNG _rng,
        uint256 _rngLookahead
    ) external reinitializer(2) {
        __StakeControllerBase_initialize(
            _governor,
            _core,
            _vault,
            _sortitionModule,
            _minStakingTime,
            _maxDrawingTime,
            _rng,
            _rngLookahead
        );
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //
}
