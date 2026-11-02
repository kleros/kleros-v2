// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

/// @title IDisputeKit
/// @notice An interface of the Dispute Kits intended for interacting with KlerosCore.
/// @dev It does not intend to abstract the interactions with the user (such as voting or appeal funding) to allow for implementation-specific parameters.
interface IDisputeKit {
    // ************************************ //
    // *             Events               * //
    // ************************************ //

    /// @notice Emitted when casting a vote to provide the justification of juror's choice.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _juror Address of the juror.
    /// @param _voteIDs The identifiers of the votes in the dispute.
    /// @param _choice The choice juror voted for.
    /// @param _justification Justification of the choice.
    event VoteCast(
        uint256 indexed _coreDisputeID,
        address indexed _juror,
        uint256[] _voteIDs,
        uint256 indexed _choice,
        string _justification
    );

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Creates a local dispute and maps it to the dispute ID in the Core contract.
    /// @dev Access restricted to Kleros Core only.
    /// @dev The new `KlerosCore.Round` must be created before calling this function.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _numberOfChoices Number of choices of the dispute.
    function createDispute(uint256 _coreDisputeID, uint256 _coreRoundID, uint256 _numberOfChoices) external;

    /// @notice Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
    /// @dev Access restricted to Kleros Core only.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _nonce Nonce.
    /// @param _roundNbVotes The number of votes in the round, including already drawn and yet to be drawn.
    /// @return drawnAddress The drawn address.
    /// @return fromSubcourtID The subcourt ID from which the juror was drawn.
    function draw(
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 _roundNbVotes
    ) external returns (address drawnAddress, uint96 fromSubcourtID);

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Gets the current ruling of a specified dispute.
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _coreDisputeID) external view returns (uint256 ruling, bool tied, bool overridden);

    /// @notice Gets the rewards for PNK and fees.
    /// @notice Intended to be called by KlerosCore. External callers must validate inputs beforehand.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @param _feeRewardPool Total amount of fees available for rewards to all coherent jurors.
    /// @param _pnkRewardPool Total amount of PNK available for rewards to all coherent jurors.
    /// @return feeReward The fee reward the juror is eligible to.
    /// @return pnkReward The pnk reward the juror is eligible to.
    function getRewards(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _feeRewardPool,
        uint256 _pnkRewardPool
    ) external view returns (uint256 feeReward, uint256 pnkReward);

    /// @notice Gets the pnk penalty for incoherent juror.
    /// @notice Intended to be called by KlerosCore. External callers must validate inputs beforehand.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @param _pnkAtStake Pnk amount subjected to penalty.
    /// @return penalty Juror's penalty.
    function getPenalty(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _pnkAtStake
    ) external view returns (uint256 penalty);

    /// @notice Returns true if all of the jurors have cast their commits for the last round.
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether all of the jurors have cast their commits for the last round.
    function areCommitsAllCast(uint256 _coreDisputeID) external view returns (bool);

    /// @notice Returns true if all of the jurors have cast their votes for the last round.
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether all of the jurors have cast their votes for the last round.
    function areVotesAllCast(uint256 _coreDisputeID) external view returns (bool);

    /// @notice Returns true if the appeal time is finished prematurely (e.g. when losing side didn't fund).
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether the appeal time is finished.
    function isAppealTimeFinished(uint256 _coreDisputeID) external view returns (bool);

    /// @notice Returns the next round settings for a given dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return newCourtID Court ID after jump.
    /// @return newDisputeKitID Dispute kit ID after jump.
    /// @return newRoundNbVotes The number of votes in the new round.
    function getNextRoundSettings(
        uint256 _coreDisputeID
    ) external view returns (uint96 newCourtID, uint256 newDisputeKitID, uint256 newRoundNbVotes);

    /// @notice Returns true if the specified voter was active in this round.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the voter.
    /// @return Whether the voter was active or not.
    function isVoteActive(uint256 _coreDisputeID, uint256 _coreRoundID, uint256 _voteID) external view returns (bool);

    /// @notice Returns the info of the specified round in the core contract.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _choice The choice to query.
    /// @return winningChoice The winning choice of this round.
    /// @return tied Whether it's a tie or not.
    /// @return totalVoted Number of jurors who cast the vote already.
    /// @return totalCommitted Number of jurors who cast the commit already (only relevant for hidden votes).
    /// @return nbVoters Total number of voters in this round.
    /// @return choiceCount Number of votes cast for the queried choice.
    function getRoundInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _choice
    )
        external
        view
        returns (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommitted,
            uint256 nbVoters,
            uint256 choiceCount
        );

    /// @notice Returns the vote information for a given vote ID.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @return account The address of the juror who cast the vote.
    /// @return commit The commit of the vote.
    /// @return choice The choice that got the vote.
    /// @return voted Whether the vote was cast or not.
    function getVoteInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) external view returns (address account, bytes32 commit, uint256 choice, bool voted);
}
