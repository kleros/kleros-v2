// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {SortitionModuleV2Base} from "./SortitionModuleV2Base.sol";
import {IStakeController} from "../interfaces/IStakeController.sol";
import {KlerosCore} from "../KlerosCore.sol";

/// @title SortitionModuleV2Neo
/// @notice Enhanced implementation of the pure sortition module with stake limits
/// @dev Contains tree management and drawing logic with additional sortition constraints
contract SortitionModuleV2Neo is SortitionModuleV2Base {
    string public constant override version = "2.1.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public maxStakePerJuror; // Maximum stake amount per juror in any court
    uint256 public maxTotalStakedInCourt; // Maximum total stake allowed per court

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when stake limits are updated
    /// @param maxStakePerJuror New maximum stake per juror
    /// @param maxTotalStakedInCourt New maximum total stake per court
    event StakeLimitsUpdated(uint256 maxStakePerJuror, uint256 maxTotalStakedInCourt);

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
    /// @param _stakeController The StakeController contract.
    /// @param _maxStakePerJuror Maximum stake amount per juror.
    /// @param _maxTotalStakedInCourt Maximum total stake per court.
    function initialize(
        address _governor,
        KlerosCore _core,
        IStakeController _stakeController,
        uint256 _maxStakePerJuror,
        uint256 _maxTotalStakedInCourt
    ) external initializer {
        __SortitionModuleV2Base_initialize(_governor, _core, _stakeController);

        maxStakePerJuror = _maxStakePerJuror;
        maxTotalStakedInCourt = _maxTotalStakedInCourt;

        emit StakeLimitsUpdated(_maxStakePerJuror, _maxTotalStakedInCourt);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Change the maximum stake per juror
    /// @param _maxStakePerJuror The new maximum stake per juror
    function changeMaxStakePerJuror(uint256 _maxStakePerJuror) external onlyByGovernor {
        maxStakePerJuror = _maxStakePerJuror;
        emit StakeLimitsUpdated(_maxStakePerJuror, maxTotalStakedInCourt);
    }

    /// @dev Change the maximum total stake per court
    /// @param _maxTotalStakedInCourt The new maximum total stake per court
    function changeMaxTotalStakedInCourt(uint256 _maxTotalStakedInCourt) external onlyByGovernor {
        maxTotalStakedInCourt = _maxTotalStakedInCourt;
        emit StakeLimitsUpdated(maxStakePerJuror, _maxTotalStakedInCourt);
    }

    // ************************************* //
    // *         Enhanced Sortition        * //
    // ************************************* //

    /// @dev Enhanced setStake with validation of stake limits
    /// @param _account The juror address
    /// @param _courtID The court ID
    /// @param _newStake The new stake amount
    /// @return success Whether the operation was successful
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake
    ) external override onlyByStakeController returns (bool success) {
        // Validate stake limits before setting
        if (_newStake > 0) {
            // Check maximum stake per juror
            if (_newStake > maxStakePerJuror) {
                return false; // Above maximum stake per juror
            }

            // Check maximum total stake in court
            uint256 currentTotalStake = this.getTotalStakeInCourt(_courtID);
            uint256 currentJurorStake = this.stakeOf(_account, _courtID);
            uint256 stakeIncrease = _newStake > currentJurorStake ? _newStake - currentJurorStake : 0;

            if (currentTotalStake + stakeIncrease > maxTotalStakedInCourt) {
                return false; // Would exceed court total stake limit
            }
        }

        // If all validations pass, use the base implementation
        return _setStake(_account, _courtID, _newStake);
    }
}
