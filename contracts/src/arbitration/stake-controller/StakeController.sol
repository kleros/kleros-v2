// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {StakeControllerBase} from "./StakeControllerBase.sol";
import {IPNKVault} from "../interfaces/IPNKVault.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {KlerosCore} from "../KlerosCore.sol";
import {RNG} from "../../rng/RNG.sol";

/// @title StakeController
/// @notice Basic implementation of the Stake Controller
/// @dev Coordinates between PNKVault and SortitionModule for the new architecture
contract StakeController is StakeControllerBase {
    string public constant override version = "1.0.0";

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
    /// @param _vault The PNKVault contract.
    /// @param _sortitionModule The SortitionModule contract.
    /// @param _minStakingTime The minimum staking time.
    /// @param _maxDrawingTime The maximum drawing time.
    /// @param _rng The random number generator.
    /// @param _rngLookahead The RNG lookahead time.
    function initialize(
        address _governor,
        KlerosCore _core,
        IPNKVault _vault,
        ISortitionModule _sortitionModule,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        RNG _rng,
        uint256 _rngLookahead
    ) external initializer {
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
}
