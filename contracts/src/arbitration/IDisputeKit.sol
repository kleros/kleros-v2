// SPDX-License-Identifier: MIT

/**
 *  @authors: [@unknownunknown1, @jaybuidl]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8;

import "./IArbitrator.sol";

/**
 *  @title IDisputeKit
 *  An abstraction of the Dispute Kits intended for interfacing with KlerosCore.
 *  It does not intend to abstract the interactions with the user (such as voting or appeal funding) to allow for implementation-specific parameters.
 */
interface IDisputeKit {
    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /** @dev Creates a local dispute and maps it to the dispute ID in the Core contract.
     *  Note: Access restricted to Kleros Core only.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @param _numberOfChoices Number of choices of the dispute
     *  @param _extraData Additional info about the dispute, for possible use in future dispute kits.
     */
    function createDispute(
        uint256 _coreDisputeID,
        uint256 _numberOfChoices,
        bytes calldata _extraData
    ) external;

    /** @dev Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
     *  Note: Access restricted to Kleros Core only.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @return drawnAddress The drawn address.
     */
    function draw(uint256 _coreDisputeID) external returns (address drawnAddress);

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /** @dev Gets the current ruling of a specified dispute.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @return ruling The current ruling.
     */
    function currentRuling(uint256 _coreDisputeID) external view returns (uint256 ruling);

    /** @dev Returns the voting data from the most relevant round.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @return winningChoiece The winning choice of this round.
     *  @return tied Whether it's a tie or not.
     */
    function getLastRoundResult(uint256 _coreDisputeID) external view returns (uint256 winningChoiece, bool tied);

    /** @dev Gets the degree of coherence of a particular voter. This function is called by Kleros Core in order to determine the amount of the reward.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
     *  @param _voteID The ID of the vote.
     *  @return The degree of coherence in basis points.
     */
    function getDegreeOfCoherence(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) external view returns (uint256);

    /** @dev Gets the number of jurors who are eligible to a reward in this round.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
     *  @return The number of coherent jurors.
     */
    function getCoherentCount(uint256 _coreDisputeID, uint256 _coreRoundID) external view returns (uint256);

    /** @dev Returns true if all of the jurors have cast their commits for the last round.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @return Whether all of the jurors have cast their commits for the last round.
     */
    function areCommitsAllCast(uint256 _coreDisputeID) external view returns (bool);

    /** @dev Returns true if all of the jurors have cast their votes for the last round.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @return Whether all of the jurors have cast their votes for the last round.
     */
    function areVotesAllCast(uint256 _coreDisputeID) external view returns (bool);

    /** @dev Returns true if the specified voter was active in this round.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
     *  @param _voteID The ID of the voter.
     *  @return Whether the voter was active or not.
     */
    function isVoteActive(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) external view returns (bool);

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

    function getVoteInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    )
        external
        view
        returns (
            address account,
            bytes32 commit,
            uint256 choice,
            bool voted
        );
}
