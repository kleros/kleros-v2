// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "./IArbitratorV2.sol";

/// @title IDisputeKit
/// @notice An abstraction of the Dispute Kits intended for interfacing with KlerosCore.
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
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _numberOfChoices Number of choices of the dispute
    /// @param _extraData Additional info about the dispute, for possible use in future dispute kits.
    /// @param _nbVotes Maximal number of votes this dispute can get. Added for future-proofing.
    function createDispute(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _numberOfChoices,
        bytes calldata _extraData,
        uint256 _nbVotes
    ) external;

    /// @notice Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
    /// @dev Access restricted to Kleros Core only.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _nonce Nonce.
    /// @return drawnAddress The drawn address.
    function draw(
        uint256 _coreDisputeID,
        uint256 _nonce
    ) external returns (address drawnAddress, uint96 fromSubcourtID);

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Gets the current ruling of a specified dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _coreDisputeID) external view returns (uint256 ruling, bool tied, bool overridden);

    /// @notice Gets the degree of coherence of a particular voter.
    /// @dev This function is called by Kleros Core in order to determine the amount of the reward.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @param _feePerJuror The fee per juror.
    /// @param _pnkAtStakePerJuror The PNK at stake per juror.
    /// @return pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    /// @return feeCoherence The degree of coherence in basis points for the dispute fee reward.
    function getDegreeOfCoherenceReward(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _feePerJuror,
        uint256 _pnkAtStakePerJuror
    ) external view returns (uint256 pnkCoherence, uint256 feeCoherence);

    /// @notice Gets the degree of coherence of a particular voter.
    /// @dev This function is called by Kleros Core in order to determine the amount of the penalty.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @param _feePerJuror The fee per juror.
    /// @param _pnkAtStakePerJuror The PNK at stake per juror.
    /// @return pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    function getDegreeOfCoherencePenalty(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _feePerJuror,
        uint256 _pnkAtStakePerJuror
    ) external view returns (uint256 pnkCoherence);

    /// @notice Gets the number of jurors who are eligible to a reward in this round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @return The number of coherent jurors.
    function getCoherentCount(uint256 _coreDisputeID, uint256 _coreRoundID) external view returns (uint256);

    /// @notice Returns true if all of the jurors have cast their commits for the last round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether all of the jurors have cast their commits for the last round.
    function areCommitsAllCast(uint256 _coreDisputeID) external view returns (bool);

    /// @notice Returns true if all of the jurors have cast their votes for the last round.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether all of the jurors have cast their votes for the last round.
    function areVotesAllCast(uint256 _coreDisputeID) external view returns (bool);

    /// @notice Returns true if the appeal funding is finished prematurely (e.g. when losing side didn't fund).
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether the appeal funding is finished.
    function isAppealFunded(uint256 _coreDisputeID) external view returns (bool);

    /// @dev Returns true if the dispute is jumping to a parent court.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether the dispute is jumping to a parent court or not.
    function earlyCourtJump(uint256 _coreDisputeID) external view returns (bool);

    /// @notice Returns the number of votes after the appeal.
    /// @param _previousDisputeKit The previous Dispute Kit.
    /// @param _currentNbVotes The number of votes before the appeal.
    /// @return The number of votes after the appeal.
    function getNbVotesAfterAppeal(
        IDisputeKit _previousDisputeKit,
        uint256 _currentNbVotes
    ) external view returns (uint256);

    /// @notice Returns the dispute kit ID to be used after court jump by Kleros Core.
    /// @return The ID of the dispute kit in Kleros Core disputeKits array.
    function getJumpDisputeKitID() external view returns (uint256);

    /// @notice Returns true if the specified voter was active in this round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the voter.
    /// @return Whether the voter was active or not.
    function isVoteActive(uint256 _coreDisputeID, uint256 _coreRoundID, uint256 _voteID) external view returns (bool);

    /// @notice Returns the info of the specified round in the core contract.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _choice The choice to query.
    /// @return winningChoice The winning choice of this round.
    /// @return tied Whether it's a tie or not.
    /// @return totalVoted Number of jurors who cast the vote already.
    /// @return totalCommited Number of jurors who cast the commit already (only relevant for hidden votes).
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
            uint256 totalCommited,
            uint256 nbVoters,
            uint256 choiceCount
        );

    /// @notice Returns the vote information for a given vote ID.
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
