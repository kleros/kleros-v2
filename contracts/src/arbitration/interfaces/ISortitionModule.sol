// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "../../libraries/Constants.sol";
import {ICourtEligibility} from "./ICourtEligibility.sol";

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

    /// @notice Executes the delayed stakes.
    /// Note that if the stake is being manually set while the delayed stake is present, the frontend should execute the delayed stake first.
    /// @dev `O(n)` where `n` is the number of processed delayed stakes.
    /// @param _accounts Accounts to process.
    /// @param _courtIDs Courts to process, respective to each account.
    function executeDelayedStakes(address[] memory _accounts, uint96[] memory _courtIDs) external;

    /// @notice Create a sortition sum tree at the specified key.
    /// @param _courtID The ID of the court.
    function createTree(uint96 _courtID) external;

    /// @notice Update the state of the stakes.
    ///
    /// @dev `O(n + p * log_k(j))` where
    /// `n` is the number of courts the juror has staked in,
    /// `p` is the depth of the court tree,
    /// `k` is the minimum number of children per node of one of these courts' sortition sum tree,
    /// and `j` is the maximum number of jurors that ever staked in one of these courts simultaneously.
    ///
    /// @param _account The address of the juror.
    /// @param _courtID The ID of the court.
    /// @param _newStake The new stake.
    /// @param _forced Whether the stake is forced (e.g forcedUnstake) or not.
    /// @return Whether all requirements for staking bypassed or not.
    function setStake(address _account, uint96 _courtID, uint256 _newStake, bool _forced) external returns (bool);

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
    function registerDisputeForDrawing(uint256 _disputeID) external;

    /// @notice Triggers the state changes after drawing.
    function completeDisputeDrawing() external;

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Draw an ID from a tree using a number.
    ///
    /// @dev This function returns 0 address if the sum of all values in the tree is 0.
    /// `O(k * log_k(n))` where
    /// `k` is the maximum number of children per node in the tree,
    ///  and `n` is the maximum number of nodes ever appended.
    ///
    /// @param _courtID The ID of the court.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _nonce Nonce to hash with random number.
    /// @return drawnAddress The drawn address.
    /// @return fromSubcourtID The court ID where the tokens were explicitly staked.
    function draw(
        uint96 _courtID,
        uint256 _coreDisputeID,
        uint256 _nonce
    ) external view returns (address drawnAddress, uint96 fromSubcourtID);

    /// @notice Gets the juror's total staked and locked PNK.
    /// @param _juror The address of the juror.
    /// @return stakedPnk The total amount of PNK staked.
    /// @return lockedPnk The total amount of PNK locked in disputes.
    function getJurorBalance(address _juror) external view returns (uint256 stakedPnk, uint256 lockedPnk);

    /// @notice Gets the stake of a juror in a court.
    /// @dev Returns the direct stake of the court and doesn't include children.
    /// @param _juror The address of the juror.
    /// @param _courtID The ID of the court.
    /// @return The stake of the juror in the court.
    function stakeOf(address _juror, uint96 _courtID) external view returns (uint256);

    /// @notice Gets the court identifiers where a specific `_juror` has staked.
    /// @param _juror The address of the juror.
    /// @return Array of courts where the juror has staked.
    function getJurorCourtIDs(address _juror) external view returns (uint96[] memory);

    /// @notice Checks if the juror is staked in any court.
    /// @param _juror The address of the juror.
    /// @return Whether the juror is staked or not.
    function isJurorStaked(address _juror) external view returns (bool);
}
