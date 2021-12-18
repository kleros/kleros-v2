// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import {SortitionSumTreeFactory} from "../../data-structures/SortitionSumTreeFactory.sol";
// import "../DisputeKitPlurality.sol";
import "../IArbitrable.sol";
import "../AbstractDisputeKit.sol";

contract MockKlerosCore {
    using SortitionSumTreeFactory for SortitionSumTreeFactory.SortitionSumTrees; // Use library functions for sortition sum trees.
    SortitionSumTreeFactory.SortitionSumTrees internal sortitionSumTrees; // The sortition sum trees.

    struct Dispute {
        // Note that appeal `0` is equivalent to the first round of the dispute.
        uint96 subcourtID; // The ID of the subcourt the dispute is in.
        IArbitrable arbitrated; // The arbitrated arbitrable contract.
        // The number of choices jurors have when voting. This does not include choice `0` which is reserved for "refuse to arbitrate"/"no ruling".
        uint256 numberOfChoices;
        //Period period; // The current period of the dispute.
        uint256 lastPeriodChange; // The last time the period was changed.
        // The votes in the form `votes[appeal][voteID]`. On each round, a new list is pushed and packed with as many empty votes as there are draws. We use `dispute.votes.length` to get the number of appeals plus 1 for the first round.
        // Vote[][] votes;
        //VoteCounter[] voteCounters; // The vote counters in the form `voteCounters[appeal]`.
        uint256[] tokensAtStakePerJuror; // The amount of tokens at stake for each juror in the form `tokensAtStakePerJuror[appeal]`.
        uint256[] totalFeesForJurors; // The total juror fees paid in the form `totalFeesForJurors[appeal]`.
        uint256 drawsInRound; // A counter of draws made in the current round.
        uint256 commitsInRound; // A counter of commits made in the current round.
        uint256[] votesInEachRound; // A counter of votes made in each round in the form `votesInEachRound[appeal]`.
        // A counter of vote reward repartitions made in each round in the form `repartitionsInEachRound[appeal]`.
        uint256[] repartitionsInEachRound;
        uint256[] penaltiesInEachRound; // The amount of tokens collected from penalties in each round in the form `penaltiesInEachRound[appeal]`.
        bool ruled; // True if the ruling has been executed, false otherwise.
    }

    struct Court {
        uint96 parent; // The parent court.
        uint[] children; // List of child courts.
        bool hiddenVotes; // Whether to use commit and reveal or not.
        uint minStake; // Minimum tokens needed to stake in the court.
        uint alpha; // Basis point of tokens that are lost when incoherent.
        uint feeForJuror; // Arbitration fee paid per juror.
        // The appeal after the one that reaches this number of jurors will go to the parent court if any, otherwise, no more appeals are possible.
        uint jurorsForCourtJump;
        uint[4] timesPerPeriod; // The time allotted to each dispute period in the form `timesPerPeriod[period]`.
    }

    uint public constant MIN_JURORS = 3; // The global default minimum number of jurors in a dispute.

    Dispute[] public disputes;
    Court[] public courts;

    AbstractDisputeKit disputeKit;

    constructor() {
        sortitionSumTrees.createTree(bytes32(0), 3);
    }

    // TODO: only owner
    function registerDisputeKit(AbstractDisputeKit _disputeKit) external {
        disputeKit = _disputeKit;
    }

    function createDispute(uint256 _choices, bytes calldata _extraData) external payable returns (uint256 disputeID) {
        (uint96 subcourtID, uint minJurors) = extraDataToSubcourtIDAndMinJurors(_extraData);
        disputeID = disputes.length;

        Court storage court = courts[0];

        disputeKit.createDispute(
            disputeID, 
            msg.value,
            court.feeForJuror,
            court.minStake,
            court.alpha,
             _choices, 
             _extraData);

        //emit DisputeCreation(disputeID, IArbitrable(msg.sender));
    }

    function getSortitionSumTree(bytes32 _key)
        public
        view
        returns (
            uint256 k,
            uint256[] memory stack,
            uint256[] memory nodes
        )
    {
        SortitionSumTreeFactory.SortitionSumTree storage tree = sortitionSumTrees.sortitionSumTrees[_key];
        k = tree.K;
        stack = tree.stack;
        nodes = tree.nodes;
    }

    function getSortitionSumTreeID(bytes32 _key, uint256 _nodeIndex) public view returns (bytes32 ID) {
        ID = sortitionSumTrees.sortitionSumTrees[_key].nodeIndexesToIDs[_nodeIndex];
    }

    function getDispute(uint256 _id) public view returns (Dispute memory) {
        return disputes[_id];
    }

    /** @dev Gets a subcourt ID and the minimum number of jurors required from a specified extra data bytes array.
     *  @param _extraData The extra data bytes array. The first 32 bytes are the subcourt ID and the next 32 bytes are the minimum number of jurors.
     *  @return subcourtID The subcourt ID.
     *  @return minJurors The minimum number of jurors required.
     */
    function extraDataToSubcourtIDAndMinJurors(bytes memory _extraData) internal view returns (uint96 subcourtID, uint minJurors) {
        if (_extraData.length >= 64) {
            assembly { // solium-disable-line security/no-inline-assembly
                subcourtID := mload(add(_extraData, 0x20))
                minJurors := mload(add(_extraData, 0x40))
            }
            if (subcourtID >= courts.length) subcourtID = 0;
            if (minJurors == 0) minJurors = MIN_JURORS;
        } else {
            subcourtID = 0;
            minJurors = MIN_JURORS;
        }
    }
}
