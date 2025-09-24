// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../../libraries/Constants.sol";

/// @title ISortitionModule
/// @notice Interface for the SortitionModule contract.
interface ISortitionModule {
    // ************************************* //
    // *              Enums                * //
    // ************************************* //

    enum Phase {
        staking, // Stake sum trees can be updated. Pass after `minStakingTime` passes and there is at least one dispute without jurors.
        generating, // Waiting for a random number. Pass as soon as it is ready.
        drawing // Jurors can be drawn. Pass after all disputes have jurors or `maxDrawingTime` passes.
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice Emitted when the phase is changed.
    /// @param _phase The new phase.
    event NewPhase(Phase _phase);

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Passes the phase.
    function passPhase() external;

    /// @notice Executes the next delayed stakes.
    /// @param _iterations The number of delayed stakes to execute.
    function executeDelayedStakes(uint256 _iterations) external;

    /// @notice Create a sortition sum tree at the specified key.
    /// @param _courtID The ID of the court.
    /// @param _extraData Extra data that contains the number of children each node in the tree should have.
    function createTree(uint96 _courtID, bytes memory _extraData) external;

    /// @notice Validate the specified juror's new stake for a court.
    /// @dev No state changes should be made when returning stakingResult != Successful, otherwise delayed stakes might break invariants.
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// @param _noDelay True if the stake change should not be delayed.
    /// @return pnkDeposit The amount of PNK to be deposited.
    /// @return pnkWithdrawal The amount of PNK to be withdrawn.
    /// @return stakingResult The result of the staking operation.
    function validateStake(
        address _account,
        uint96 _courtID,
        uint256 _newStake,
        bool _noDelay
    ) external returns (uint256 pnkDeposit, uint256 pnkWithdrawal, StakingResult stakingResult);

    /// @notice Update the state of the stakes, called by KC at the end of setStake flow.
    ///
    /// @dev `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _pnkDeposit The amount of PNK to be deposited.
    /// @param _pnkWithdrawal The amount of PNK to be withdrawn.
    /// @param _newStake The new stake.
    function setStake(
        address _account,
        uint96 _courtID,
        uint256 _pnkDeposit,
        uint256 _pnkWithdrawal,
        uint256 _newStake
    ) external;

    /// @notice Update the state of the stakes with a PNK reward deposit, called by KC during rewards execution.
    ///
    /// @dev `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _penalty The amount of PNK to be deducted.
    /// @return pnkBalance The updated total PNK balance of the juror, including the penalty.
    /// @return newCourtStake The updated stake of the juror in the court.
    /// @return availablePenalty The amount of PNK that was actually deducted.
    function setStakePenalty(
        address _account,
        uint96 _courtID,
        uint256 _penalty
    ) external returns (uint256 pnkBalance, uint256 newCourtStake, uint256 availablePenalty);

    /// @notice Update the state of the stakes with a PNK reward deposit, called by KC during rewards execution.
    ///
    /// @dev `O(n + p * log_k(j))` where
    /// `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _reward The amount of PNK to be deposited as a reward.
    /// @return success True if the reward was added successfully.
    function setStakeReward(address _account, uint96 _courtID, uint256 _reward) external returns (bool success);

    /// @notice Unstakes the inactive juror from all courts.
    ///
    /// @dev `O(n * (p * log_k(j)) )` where
    /// `O(n * (p * log_k(j)) )` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The juror to unstake.
    function forcedUnstakeAllCourts(address _account) external;

    /// @notice Unstakes the inactive juror from a specific court.
    ///
    /// @dev `O(n * (p * log_k(j)) )` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The juror to unstake.
    /// @param _courtID The ID of the court.
    function forcedUnstake(address _account, uint96 _courtID) external;

    /// @notice Locks the tokens of the drawn juror.
    /// @param _account The address of the juror.
    /// @param _relativeAmount The amount to lock.
    function lockStake(address _account, uint256 _relativeAmount) external;

    /// @notice Unlocks the tokens of the drawn juror.
    /// @param _account The address of the juror.
    /// @param _relativeAmount The amount to unlock.
    function unlockStake(address _account, uint256 _relativeAmount) external;

    /// @notice Triggers the state changes after dispute creation.
    /// @param _disputeID The ID of the dispute.
    /// @param _roundID The ID of the round.
    function createDisputeHook(uint256 _disputeID, uint256 _roundID) external;

    /// @notice Triggers the state changes after drawing.
    /// @param _disputeID The ID of the dispute.
    /// @param _roundID The ID of the round.
    function postDrawHook(uint256 _disputeID, uint256 _roundID) external;

    /// @notice Gives back the locked PNKs in case the juror fully unstaked earlier.
    ///
    /// @dev that since locked and staked PNK are async it is possible for the juror to have positive staked PNK balance
    /// while having 0 stake in courts and 0 locked tokens (eg. when the juror fully unstaked during dispute and later got his tokens unlocked).
    /// In this case the juror can use this function to withdraw the leftover tokens.
    /// Also note that if the juror has some leftover PNK while not fully unstaked he'll have to manually unstake from all courts to trigger this function.
    ///
    /// @param _account The juror whose PNK to withdraw.
    function withdrawLeftoverPNK(address _account) external;

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Draw an ID from a tree using a number.
    ///
    /// @dev that this function reverts if the sum of all values in the tree is 0.
    /// `O(k * log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    ///
    /// @param _courtID The ID of the court.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _nonce Nonce to hash with random number.
    /// @return drawnAddress The drawn address.
    function draw(
        uint96 _courtID,
        uint256 _coreDisputeID,
        uint256 _nonce
    ) external view returns (address drawnAddress, uint96 fromSubcourtID);

    /// @notice Gets the balance of a juror in a court.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return totalStakedPnk The total amount of tokens staked including locked tokens and penalty deductions. Equivalent to the effective stake in the General court.
    /// @return totalLocked The total amount of tokens locked in disputes.
    /// @return stakedInCourt The amount of tokens staked in the specified court including locked tokens and penalty deductions.
    /// @return nbCourts The number of courts the juror has directly staked in.
    function getJurorBalance(
        address _juror,
        uint96 _courtID
    ) external view returns (uint256 totalStakedPnk, uint256 totalLocked, uint256 stakedInCourt, uint256 nbCourts);

    /// @notice Gets the court identifiers where a specific `_juror` has staked.
    /// @param _juror The address of the juror.
    function getJurorCourtIDs(address _juror) external view returns (uint96[] memory);

    /// @notice Checks if the juror is staked in any court.
    /// @param _juror The address of the juror.
    /// @return Whether the juror is staked or not.
    function isJurorStaked(address _juror) external view returns (bool);

    /// @notice Checks if the juror has any leftover PNK in the contract.
    /// @param _juror The address of the juror.
    /// @return Whether the juror has leftover PNK.
    function getJurorLeftoverPNK(address _juror) external view returns (uint256);
}
