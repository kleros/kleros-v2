// SPDX-License-Identifier: MIT

/**
 *  @custom:authors: [@jaybuidl]
 *  @custom:reviewers: []
 *  @custom:auditors: []
 *  @custom:bounties: []
 *  @custom:deployments: []
 */

pragma solidity 0.8.18;

import "./SortitionModule.sol";

/// @title SortitionModule
/// @dev A factory of trees that keeps track of staked values for sortition.
contract SortitionModuleNeo is SortitionModule {
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
    ) external reinitializer(1) {
        super._initialize(_governor, _core, _minStakingTime, _maxDrawingTime, _rng, _rngLookahead);
        maxStakePerJuror = _maxStakePerJuror;
        maxTotalStaked = _maxTotalStaked;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeMaxStakePerJuror(uint256 _maxStakePerJuror) external onlyByGovernor {
        maxStakePerJuror = _maxStakePerJuror;
    }

    function changeMaxTotalStaked(uint256 _maxTotalStaked) external onlyByGovernor {
        maxTotalStaked = _maxTotalStaked;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Sets the specified juror's stake in a court.
    /// `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// @param _alreadyTransferred True if the tokens were already transferred from juror. Only relevant for delayed stakes.
    /// @return pnkDeposit The amount of PNK to be deposited.
    /// @return pnkWithdrawal The amount of PNK to be withdrawn.
    /// @return succeeded True if the call succeeded, false otherwise.
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _alreadyTransferred
    ) external override onlyByCore returns (uint256 pnkDeposit, uint256 pnkWithdrawal, bool succeeded) {
        uint256 currentStake = stakeOf(_account, _courtID);
        uint256 stakeIncrease = _newStake - currentStake;
        Juror storage juror = jurors[_account];
        if (juror.stakedPnk + stakeIncrease > maxStakePerJuror) {
            return (0, 0, false);
        }
        if (totalStaked + stakeIncrease > maxTotalStaked) {
            return (0, 0, false);
        }
        if (phase == Phase.staking) {
            totalStaked += stakeIncrease;
        }

        (pnkDeposit, pnkWithdrawal, succeeded) = super._setStake(_account, _courtID, _newStake, _alreadyTransferred);
    }
}
