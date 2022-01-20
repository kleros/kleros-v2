// SPDX-License-Identifier: MIT

/**
 *  @authors: [@unknownunknown1, @jaybuidl]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8;

import "../IArbitrator.sol";

/**
 *  @title DisputeKit
 *  Dispute kit abstraction for Kleros v2.
 */
abstract contract DisputeKit {
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
    ) external virtual;

    /** @dev Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
     *  Note: Access restricted to Kleros Core only.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @return drawnAddress The drawn address.
     */
    function draw(uint256 _disputeID) external virtual returns (address drawnAddress);

    /** @dev Sets the caller's commit for the specified votes.
     *  `O(n)` where
     *  `n` is the number of votes.
     *  @param _disputeID The ID of the dispute.
     *  @param _voteIDs The IDs of the votes.
     *  @param _commit The commit.
     */
    function castCommit(
        uint256 _disputeID,
        uint256[] calldata _voteIDs,
        bytes32 _commit
    ) external virtual;

    /** @dev Sets the caller's choices for the specified votes.
     *  `O(n)` where
     *  `n` is the number of votes.
     *  @param _disputeID The ID of the dispute.
     *  @param _voteIDs The IDs of the votes.
     *  @param _choice The choice.
     *  @param _salt The salt for the commit if the votes were hidden.
     */
    function castVote(
        uint256 _disputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        uint256 _salt
    ) external virtual;

    /** @dev Manages contributions, and appeals a dispute if at least two choices are fully funded.
     *  Note that the surplus deposit will be reimbursed.
     *  @param _disputeID Index of the dispute in Kleros Core contract.
     *  @param _choice A choice that receives funding.
     */
    function fundAppeal(uint256 _disputeID, uint256 _choice) external payable virtual;

    /** @dev Allows to withdraw any reimbursable fees or rewards after the dispute gets resolved.
     *  @param _disputeID Index of the dispute in Kleros Core contract.
     *  @param _beneficiary The address whose rewards to withdraw.
     *  @param _round The round the caller wants to withdraw from.
     *  @param _choice The ruling option that the caller wants to withdraw from.
     *  @return amount The withdrawn amount.
     */
    function withdrawFeesAndRewards(
        uint256 _disputeID,
        address payable _beneficiary,
        uint256 _round,
        uint256 _choice
    ) external virtual returns (uint256 amount);

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /** @dev Gets the current ruling of a specified dispute.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @return ruling The current ruling.
     */
    function currentRuling(uint256 _disputeID) public view virtual returns (uint256 ruling);

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
    ) external view virtual returns (uint256);

    /** @dev Gets the number of jurors who are eligible to a reward in this round.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @param _round The ID of the round.
     *  @return The number of coherent jurors.
     */
    function getCoherentCount(uint256 _disputeID, uint256 _round) external view virtual returns (uint256);

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
    ) external view virtual returns (bool);

    function getRoundInfo(
        uint256 _disputeID,
        uint256 _round,
        uint256 _choice
    )
        external
        view
        virtual
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
        virtual
        returns (
            address account,
            bytes32 commit,
            uint256 choice,
            bool voted
        );
}
