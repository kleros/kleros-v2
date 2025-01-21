// SPDX-License-Identifier: MIT

/**
 *  @custom:authors: [@jaybuidl, @unknownunknown1]
 *  @custom:reviewers: []
 *  @custom:auditors: []
 *  @custom:bounties: []
 *  @custom:deployments: []
 */

pragma solidity 0.8.24;

import {SortitionModuleBase, KlerosCore, RNG, StakingResult} from "./SortitionModuleBase.sol";

/// @title SortitionModuleNeo
/// @dev A factory of trees that keeps track of staked values for sortition.
contract SortitionModuleNeo is SortitionModuleBase {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public maxStakePerJuror;
    uint256 public maxTotalStaked;
    uint256 public totalStaked;

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
    /// @param _rngLookahead Lookahead value for rng.
    /// @param _maxStakePerJuror The maximum amount of PNK a juror can stake in a court.
    /// @param _maxTotalStaked The maximum amount of PNK that can be staked in all courts.
    function initialize(
        address _governor,
        KlerosCore _core,
        uint256 _minStakingTime,
        uint256 _maxDrawingTime,
        RNG _rng,
        uint256 _rngLookahead,
        uint256 _maxStakePerJuror,
        uint256 _maxTotalStaked
    ) external reinitializer(2) {
        __SortitionModuleBase_initialize(_governor, _core, _minStakingTime, _maxDrawingTime, _rng, _rngLookahead);
        maxStakePerJuror = _maxStakePerJuror;
        maxTotalStaked = _maxTotalStaked;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Access Control to perform implementation upgrades (UUPS Proxiable)
    ///      Only the governor can perform upgrades (`onlyByGovernor`)
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    function changeMaxStakePerJuror(uint256 _maxStakePerJuror) external onlyByGovernor {
        maxStakePerJuror = _maxStakePerJuror;
    }

    function changeMaxTotalStaked(uint256 _maxTotalStaked) external onlyByGovernor {
        maxTotalStaked = _maxTotalStaked;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    function _setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _alreadyTransferred
    ) internal override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult) {
        uint256 currentStake = stakeOf(_account, _courtID);
        bool stakeIncrease = _newStake > currentStake;
        uint256 stakeChange = stakeIncrease ? _newStake - currentStake : currentStake - _newStake;
        Juror storage juror = jurors[_account];
        if (stakeIncrease && !_alreadyTransferred) {
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
        (pnkDeposit, pnkWithdrawal, stakingResult) = super._setStake(
            _account,
            _courtID,
            _newStake,
            _alreadyTransferred
        );
    }
}
