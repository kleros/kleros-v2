// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "./IArbitrator.sol";
import "../rng/RNG.sol";
import "./mock/MockKlerosCore.sol";

contract DisputeKitPlurality is AbstractDisputeKit {
    // Core --> IN
    // createDispute

    // OUT -> Core
    // report drawn jurors
    // report ruling

    // Jurors -> IN
    // vote

    // Anyone -> IN
    // requestAppeal

    // INTERNAL
    // draw jurors <-> RNG
    // receive evidence
    // aggregate votes
    // incentive (who earns how much PNK and ETH)
    // appeal crowdfunding
    // redistribution when ruling is final

    // ************************ //
    // *       STRUCTS        * //
    // ************************ //
    struct Vote {
        address account; // The address of the juror.
        bytes32 commit; // The commit of the juror. For courts with hidden votes.
        uint choice; // The choice of the juror.
        bool voted; // True if the vote has been cast or revealed, false otherwise.
    }
    struct VoteCounter {
        // The choice with the most votes. Note that in the case of a tie, it is the choice that reached the tied number of votes first.
        uint winningChoice;
        mapping(uint => uint) counts; // The sum of votes for each choice in the form `counts[choice]`.
        bool tied; // True if there is a tie, false otherwise.
    }
    struct Dispute {
        //NOTE: arbitrated needed?? But it needs the chainId too, not just an address.
        //IArbitrable arbitrated; // The address of the arbitrable contract.
        bytes arbitratorExtraData; // Extra data for the arbitrator.
        uint256 choices; // The number of choices the arbitrator can choose from.
        uint256 appealPeriodStart; // Time when the appeal funding becomes possible.        
        Vote[][] votes; // The votes in the form `votes[appeal][voteID]`. On each round, a new list is pushed and packed with as many empty votes as there are draws. We use `dispute.votes.length` to get the number of appeals plus 1 for the first round.
        VoteCounter[] voteCounters; // The vote counters in the form `voteCounters[appeal]`.
        uint[] tokensAtStakePerJurorForRound; // The amount of tokens at stake for each juror in the form `tokensAtStakePerJuror[appeal]`.
        uint[] arbitrationFeeForRound; // Fee paid by the arbitrable for the arbitration for each round. Must be equal or higher than arbitration cost.
        uint drawsInCurrentRound; // A counter of draws made in the current round.
        uint commitsInCurrentRound; // A counter of commits made in the current round.
        uint[] votesForRound; // A counter of votes made in each round in the form `votesInEachRound[appeal]`.
        uint[] repartitionsForRound; // A counter of vote reward repartitions made in each round in the form `repartitionsInEachRound[appeal]`.
        uint[] penaltiesForRound; // The amount of tokens collected from penalties in each round in the form `penaltiesInEachRound[appeal]`.
        bool ruled; // True if the ruling has been executed, false otherwise.
        uint256 ruling; // Ruling given by the arbitrator.
    }

    struct Round {
        mapping(uint256 => uint256) paidFees; // Tracks the fees paid for each choice in this round.
        mapping(uint256 => bool) hasPaid; // True if this choice was fully funded, false otherwise.
        mapping(address => mapping(uint256 => uint256)) contributions; // Maps contributors to their contributions for each choice.
        uint256 feeRewards; // Sum of reimbursable appeal fees available to the parties that made contributions to the ruling that ultimately wins a dispute.
        uint256[] fundedChoices; // Stores the choices that are fully funded.
    }

    // ************************ //
    // *       STORAGE        * //
    // ************************ //

    uint public constant ALPHA_DIVISOR = 1e4; // The number to divide `Court.alpha` by.

    // TODO: extract the necessary interfaces
    MockKlerosCore public immutable core;

    RNG public immutable rng;

    Dispute[] public disputes; // Stores the dispute info. disputes[disputeID].
    mapping(uint256 => Round[]) public disputeIDtoRounds; // Maps dispute IDs to Round array that contains the info about crowdfunding.

    constructor(MockKlerosCore _core, RNG _rng) {
        core = _core;
        rng = _rng;
    }

    // ************************ //
    // *      MODIFIERS       * //
    // ************************ //

    /**
     * Note: disputeID is maintained by KlerosCore, not the dispute kit
     * Note: the dispute kit does not receive nor validate any payment, KlerosCore does
     * Note: Permissioned
     */
    function createDispute(
        uint256 _disputeID,
        uint256 _arbitrationFee,
        uint256 _subcourtFeeForJuror,
        uint256 _subcourtMinStake,
        uint256 _subcourtAlpha,
        uint256 _choices,
        bytes calldata _extraData
    ) external override {
        require(msg.sender == address(core), "Not allowed: sender is not core");

        // -- dispute specific --
        //

        // -- subcourt specific --
        // uint minStake: min tokens required to stake on this subcourt
        // bool hiddenVotes:
        // uint alpha: bps of tokens lost when incoherent
        // uint feeForJuror: paid per juror
        // uint jurorsForCourtJump: evaluated by the appeal logic

        Dispute storage dispute = disputes.push();
        dispute.arbitratorExtraData = _extraData;
        dispute.choices = _choices;
        dispute.appealPeriodStart = 0;

        uint numberOfVotes = _arbitrationFee / _subcourtFeeForJuror;
        Vote[] storage votes = dispute.votes.push(); // TODO: the array dimensions may be reversed, check!
        while (votes.length < numberOfVotes)
                votes.push();

        dispute.voteCounters.push().tied = true;
        dispute.tokensAtStakePerJurorForRound.push((_subcourtMinStake * _subcourtAlpha) / ALPHA_DIVISOR);
        dispute.arbitrationFeeForRound.push(_arbitrationFee);
        dispute.votesForRound.push(0);
        dispute.repartitionsForRound.push(0);
        dispute.penaltiesForRound.push(0);
        dispute.ruling = 0;

        disputeIDtoRounds[_disputeID].push(); 
    } 

    function getVotes(uint _disputeID) public view returns(Vote[][] memory) {
        return disputes[_disputeID].votes;
    }

    function getVotesLength(uint _disputeID) public view returns(uint, uint) {
        return (disputes[_disputeID].votes.length, disputes[_disputeID].votes[0].length);
    }

    function getVoteCounter(uint _disputeID) public view returns(bool) {
        return disputes[_disputeID].voteCounters[disputes[_disputeID].voteCounters.length - 1].tied;
    }

    /**
     *  @dev Draws jurors for a dispute. Can be called in parts.
     *  @param _disputeID The ID of the dispute.
     *  @param _iterations The number of iterations to run.
     */
    function drawJurors(uint256 _disputeID, uint256 _iterations) external override {
        uint96 subcourtID = core.getDispute(_disputeID).subcourtID;
        bytes32 key = bytes32(bytes12(subcourtID)); // due to new conversion restrictions in v0.8
        (
            uint256 k, 
            /* stack */ ,
            uint256[] memory nodes
        ) = core.getSortitionSumTree(key);

        // TODO: run this only when starting the drawing period
        uint256 randomNumber = rng.getUncorrelatedRN(block.number);

        // TODO: batching with boundary checks
        for (uint256 i = 0; i < _iterations; i++) {
            uint256 treeIndex = draw(uint256(keccak256(abi.encodePacked(randomNumber, _disputeID, i))), k, nodes);
            bytes32 id = core.getSortitionSumTreeID(key, treeIndex);
            (address drawnAddress, /* subcourtID */) = stakePathIDToAccountAndSubcourtID(id);

            // TODO: Save the vote.
            // dispute.votes[dispute.votes.length - 1][i].account = drawnAddress;
            // jurors[drawnAddress].lockedTokens += dispute.tokensAtStakePerJuror[dispute.tokensAtStakePerJuror.length - 1];
            // emit Draw(drawnAddress, _disputeID, dispute.votes.length - 1, i);

            // TODO: Stop if dispute is fully drawn.
            // if (i == dispute.votes[dispute.votes.length - 1].length - 1) break;
        }
    }

    // ************************ //
    // *        VIEWS         * //
    // ************************ //

    function draw(
        uint256 _drawnNumber,
        uint256 _k,
        uint256[] memory _nodes
    ) private pure returns (uint256 treeIndex) {
        uint256 currentDrawnNumber = _drawnNumber % _nodes[0];
        while ((_k * treeIndex) + 1 < _nodes.length) {
            // While it still has children.
            for (uint256 i = 1; i <= _k; i++) {
                // Loop over children.
                uint256 nodeIndex = (_k * treeIndex) + i;
                uint256 nodeValue = _nodes[nodeIndex];

                if (currentDrawnNumber >= nodeValue)
                    currentDrawnNumber -= nodeValue; // Go to the next child.
                else {
                    // Pick this child.
                    treeIndex = nodeIndex;
                    break;
                }
            }
        }
    }

    /**
     *  @dev Unpacks a stake path ID into an account and a subcourt ID.
     *  @param _stakePathID The stake path ID to unpack.
     *  @return account The account.
     *  @return subcourtID The subcourt ID.
     */
    function stakePathIDToAccountAndSubcourtID(bytes32 _stakePathID)
        internal
        pure
        returns (address account, uint96 subcourtID)
    {
        assembly {
            // solium-disable-line security/no-inline-assembly
            let ptr := mload(0x40)
            for {
                let i := 0x00
            } lt(i, 0x14) {
                i := add(i, 0x01)
            } {
                mstore8(add(add(ptr, 0x0c), i), byte(i, _stakePathID))
            }
            account := mload(ptr)
            subcourtID := _stakePathID
        }
    }
}
