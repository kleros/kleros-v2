// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {SortitionModuleBase, KlerosCore, IRNG, StakingResult} from "./SortitionModuleBase.sol";

/// @title SortitionModuleNeo
/// @dev A factory of trees that keeps track of staked values for sortition.
contract SortitionModuleNeo is SortitionModuleBase {
    string public constant override version = "0.9.0";

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public maxStakePerJuror;
    uint256 public maxTotalStaked;
    uint256 public totalStaked;

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
    /// @param _maxStakePerJuror The maximum amount of PNK a juror can stake in a court.
    /// @param _maxTotalStaked The maximum amount of PNK that can be staked in all courts.
    function initialize(
        address _owner,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        IRNG _rng,
        uint256 _maxStakePerJuror,
        uint256 _maxTotalStaked
    ) external reinitializer(2) {
        __SortitionModuleBase_initialize(_owner, _core, _minStakingTime, _maxDrawingTime, _rng);
        maxStakePerJuror = _maxStakePerJuror;
        maxTotalStaked = _maxTotalStaked;
    }

    function initialize4() external reinitializer(4) {
        // NOP
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the owner can perform upgrades (`onlyByOwner`)
    function _authorizeUpgrade(address) internal view override onlyByOwner {
        // NOP
    }

    function changeMaxStakePerJuror(uint256 _maxStakePerJuror) external onlyByOwner {
        maxStakePerJuror = _maxStakePerJuror;
    }

    function changeMaxTotalStaked(uint256 _maxTotalStaked) external onlyByOwner {
        maxTotalStaked = _maxTotalStaked;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function _validateStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _noDelay
    ) internal override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        uint256 currentStake = stakeOf(_account, _courtID);
        bool stakeIncrease = _newStake > currentStake;
        uint256 stakeChange = stakeIncrease ? _newStake - currentStake : currentStake - _newStake;
        Juror storage juror = jurors[_account];
        if (stakeIncrease) {
            if (juror.stakedPnk + stakeChange > maxStakePerJuror) {
                return (0, 0, StakingResult.CannotStakeMoreThanMaxStakePerJuror);
            }
            if (totalStaked + stakeChange > maxTotalStaked) {
                return (0, 0, StakingResult.CannotStakeMoreThanMaxTotalStaked);
            }
        }
        if (phase == Phase.staking) {
            if (stakeIncrease) {
                totalStaked += stakeChange;
            } else {
                totalStaked -= stakeChange;
            }
        }
        (pnkDeposit, pnkWithdrawal, stakingResult) = super._validateStake(_account, _courtID, _newStake, _noDelay);
    }
}
