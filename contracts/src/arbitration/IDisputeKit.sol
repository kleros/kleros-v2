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
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @param _numberOfChoices Number of choices of the dispute
     *  @param _extraData Additional info about the dispute, for possible use in future dispute kits.
     */
    function createDispute(
        uint256 _disputeID,
        uint256 _numberOfChoices,
        bytes calldata _extraData
    ) external;

    /** @dev Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
     *  Note: Access restricted to Kleros Core only.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @return drawnAddress The drawn address.
     */
    function draw(uint256 _disputeID) external returns (address drawnAddress);

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /** @dev Gets the current ruling of a specified dispute.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @return ruling The current ruling.
     */
    function currentRuling(uint256 _disputeID) external view returns (uint256 ruling);

    /** @dev Gets the degree of coherence of a particular voter. This function is called by Kleros Core in order to determine the amount of the reward.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @param _round The ID of the round.
     *  @param _voteID The ID of the vote.
     *  @return The degree of coherence in basis points.
     */
    function getDegreeOfCoherence(
        uint256 _disputeID,
        uint256 _round,
        uint256 _voteID
    ) external view returns (uint256);

    /** @dev Gets the number of jurors who are eligible to a reward in this round.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @param _round The ID of the round.
     *  @return The number of coherent jurors.
     */
    function getCoherentCount(uint256 _disputeID, uint256 _round) external view returns (uint256);

    /** @dev Returns true if the specified voter was active in this round.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @param _round The ID of the round.
     *  @param _voteID The ID of the voter.
     *  @return Whether the voter was active or not.
     */
    function isVoteActive(
        uint256 _disputeID,
        uint256 _round,
        uint256 _voteID
    ) external view returns (bool);

    function getRoundInfo(
        uint256 _disputeID,
        uint256 _round,
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
        uint256 _disputeID,
        uint256 _round,
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
