// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import {SortitionSumTreeFactory} from "../../data-structures/SortitionSumTreeFactory.sol";
// import "../DisputeKitPlurality.sol";
import "../IArbitrable.sol";

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

    Dispute[] public disputes;

    constructor() {
        sortitionSumTrees.createTree(bytes32(0), 3);
    }

    // DisputeKitPlurality disputeKit;

    function getSortitionSumTree(bytes32 _key)
        public
        view
        returns (
            uint256 K,
            uint256[] memory stack,
            uint256[] memory nodes
        )
    {
        SortitionSumTreeFactory.SortitionSumTree storage tree = sortitionSumTrees.sortitionSumTrees[_key];
        K = tree.K;
        stack = tree.stack;
        nodes = tree.nodes;
    }

    function getSortitionSumTreeID(bytes32 _key, uint256 _nodeIndex) public view returns (bytes32 ID) {
        ID = sortitionSumTrees.sortitionSumTrees[_key].nodeIndexesToIDs[_nodeIndex];
    }

    function getDispute(uint256 _id) public view returns (Dispute memory) {
        return disputes[_id];
    }
}
