// SPDX-License-Identifier: MIT

/**
 *  @authors: [@unknownunknown1, @jaybuidl]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8;

import "./BaseDisputeKit.sol";
import "../../rng/RNG.sol";
import "../../evidence/IEvidence.sol";

interface IProofOfHumanity {
    /** @dev Return true if the submission is registered and not expired.
     *  @param _submissionID The address of the submission.
     *  @return Whether the submission is registered or not.
     */
    function isRegistered(address _submissionID) external view returns (bool);
}

/**
 *  @title DisputeKitSybilResistant
 *  Dispute kit implementation adapted from DisputeKitClassic
 *  - a drawing system: at most 1 vote per juror registered on Proof of Humanity,
 *  - a vote aggreation system: plurality,
 *  - an incentive system: equal split between coherent votes,
 *  - an appeal system: fund 2 choices only, vote on any choice.
 */
contract DisputeKitSybilResistant is BaseDisputeKit, IEvidence {
    // ************************************* //
    // *             Structs               * //
    // ************************************* //

    struct Dispute {
        Round[] rounds; // Rounds of the dispute. 0 is the default round, and [1, ..n] are the appeal rounds.
        uint256 numberOfChoices; // The number of choices jurors have when voting. This does not include choice `0` which is reserved for "refuse to arbitrate".
        bool jumped; // True if dispute jumped to a parent dispute kit and won't be handled by this DK anymore.
        mapping(uint256 => uint256) coreRoundIDToLocal; // Maps id of the round in the core contract to the index of the round of related local dispute.
        bytes extraData; // Extradata for the dispute.
    }

    struct Round {
        Vote[] votes; // Former votes[_appeal][].
        uint256 winningChoice; // The choice with the most votes. Note that in the case of a tie, it is the choice that reached the tied number of votes first.
        mapping(uint256 => uint256) counts; // The sum of votes for each choice in the form `counts[choice]`.
        bool tied; // True if there is a tie, false otherwise.
        uint256 totalVoted; // Former uint[_appeal] votesInEachRound.
        uint256 totalCommitted; // Former commitsInRound.
        mapping(uint256 => uint256) paidFees; // Tracks the fees paid for each choice in this round.
        mapping(uint256 => bool) hasPaid; // True if this choice was fully funded, false otherwise.
        mapping(address => mapping(uint256 => uint256)) contributions; // Maps contributors to their contributions for each choice.
        uint256 feeRewards; // Sum of reimbursable appeal fees available to the parties that made contributions to the ruling that ultimately wins a dispute.
        uint256[] fundedChoices; // Stores the choices that are fully funded.
    }

    struct Vote {
        address account; // The address of the juror.
        bytes32 commit; // The commit of the juror. For courts with hidden votes.
        uint256 choice; // The choice of the juror.
        bool voted; // True if the vote has been cast.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant WINNER_STAKE_MULTIPLIER = 10000; // Multiplier of the appeal cost that the winner has to pay as fee stake for a round in basis points. Default is 1x of appeal fee.
    uint256 public constant LOSER_STAKE_MULTIPLIER = 20000; // Multiplier of the appeal cost that the loser has to pay as fee stake for a round in basis points. Default is 2x of appeal fee.
    uint256 public constant LOSER_APPEAL_PERIOD_MULTIPLIER = 5000; // Multiplier of the appeal period for the choice that wasn't voted for in the previous round, in basis points. Default is 1/2 of original appeal period.
    uint256 public constant ONE_BASIS_POINT = 10000; // One basis point, for scaling.

    RNG public rng; // The random number generator
    IProofOfHumanity public poh; // The Proof of Humanity registry
    Dispute[] public disputes; // Array of the locally created disputes.
    mapping(uint256 => uint256) public coreDisputeIDToLocal; // Maps the dispute ID in Kleros Core to the local dispute ID.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event Contribution(
        uint256 indexed _disputeID,
        uint256 indexed _round,
        uint256 _choice,
        address indexed _contributor,
        uint256 _amount
    );

    event Withdrawal(
        uint256 indexed _disputeID,
        uint256 indexed _round,
        uint256 _choice,
        address indexed _contributor,
        uint256 _amount
    );

    event ChoiceFunded(uint256 indexed _disputeID, uint256 indexed _round, uint256 indexed _choice);

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

    modifier notJumped(uint256 _coreDisputeID) {
        require(!disputes[coreDisputeIDToLocal[_coreDisputeID]].jumped, "Dispute jumped to a parent DK!");
        _;
    }

    /** @dev Constructor.
     *  @param _governor The governor's address.
     *  @param _core The KlerosCore arbitrator.
     *  @param _rng The random number generator.
     */
    constructor(
        address _governor,
        KlerosCore _core,
        RNG _rng,
        IProofOfHumanity _poh
    ) BaseDisputeKit(_governor, _core) {
        rng = _rng;
        poh = _poh;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /** @dev Changes the `governor` storage variable.
     *  @param _governor The new value for the `governor` storage variable.
     */
    function changeGovernor(address payable _governor) external onlyByGovernor {
        governor = _governor;
    }

    /** @dev Changes the `core` storage variable.
     *  @param _core The new value for the `core` storage variable.
     */
    function changeCore(address _core) external onlyByGovernor {
        core = KlerosCore(_core);
    }

    /** @dev Changes the `_rng` storage variable.
     *  @param _rng The new value for the `RNGenerator` storage variable.
     */
    function changeRandomNumberGenerator(RNG _rng) external onlyByGovernor {
        rng = _rng;
        // TODO: if current phase is generating, call rng.requestRN() for the next block
    }

    /** @dev Changes the `poh` storage variable.
     *  @param _poh The new value for the `poh` storage variable.
     */
    function changePoh(address _poh) external onlyByGovernor {
        poh = IProofOfHumanity(_poh);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /** @dev Creates a local dispute and maps it to the dispute ID in the Core contract.
     *  Note: Access restricted to Kleros Core only.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core.
     *  @param _numberOfChoices Number of choices of the dispute
     *  @param _extraData Additional info about the dispute, for possible use in future dispute kits.
     */
    function createDispute(
        uint256 _coreDisputeID,
        uint256 _numberOfChoices,
        bytes calldata _extraData
    ) external override onlyByCore {
        uint256 localDisputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.numberOfChoices = _numberOfChoices;
        dispute.extraData = _extraData;
        // New round in the Core should be created before the dispute creation in DK.
        dispute.coreRoundIDToLocal[core.getNumberOfRounds(_coreDisputeID) - 1] = dispute.rounds.length;

        Round storage round = dispute.rounds.push();
        round.tied = true;

        coreDisputeIDToLocal[_coreDisputeID] = localDisputeID;
    }

    /** @dev Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
     *  Note: Access restricted to Kleros Core only.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core.
     *  @return drawnAddress The drawn address.
     */
    function draw(uint256 _coreDisputeID)
        external
        override
        onlyByCore
        notJumped(_coreDisputeID)
        returns (address drawnAddress)
    {
        bytes32 key = bytes32(core.getSubcourtID(_coreDisputeID)); // Get the ID of the tree.
        uint256 drawnNumber = getRandomNumber();

        (uint256 K, , uint256[] memory nodes) = core.getSortitionSumTree(key);
        uint256 treeIndex = 0;
        uint256 currentDrawnNumber = drawnNumber % nodes[0];

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];

        // TODO: Handle the situation when no one has staked yet.

        // While it still has children
        while ((K * treeIndex) + 1 < nodes.length) {
            for (uint256 i = 1; i <= K; i++) {
                // Loop over children.
                uint256 nodeIndex = (K * treeIndex) + i;
                uint256 nodeValue = nodes[nodeIndex];

                if (currentDrawnNumber >= nodeValue) {
                    // Go to the next child.
                    currentDrawnNumber -= nodeValue;
                } else {
                    // Pick this child.
                    treeIndex = nodeIndex;
                    break;
                }
            }
        }

        bytes32 ID = core.getSortitionSumTreeID(key, treeIndex);
        drawnAddress = stakePathIDToAccount(ID);

        if (!proofOfHumanity(drawnAddress)) drawnAddress = address(0);
        // TODO: deduplicate the list of all the drawn humans before moving to the next period !!

        round.votes.push(Vote({account: drawnAddress, commit: bytes32(0), choice: 0, voted: false}));
    }

    /** @dev Sets the caller's commit for the specified votes.
     *  `O(n)` where
     *  `n` is the number of votes.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core.
     *  @param _voteIDs The IDs of the votes.
     *  @param _commit The commit.
     */
    function castCommit(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes32 _commit
    ) external notJumped(_coreDisputeID) {
        require(
            core.getCurrentPeriod(_coreDisputeID) == KlerosCore.Period.commit,
            "The dispute should be in Commit period."
        );
        require(_commit != bytes32(0), "Empty commit.");

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(round.votes[_voteIDs[i]].account == msg.sender, "The caller has to own the vote.");
            require(round.votes[_voteIDs[i]].commit == bytes32(0), "Already committed this vote.");
            round.votes[_voteIDs[i]].commit = _commit;
        }
        round.totalCommitted += _voteIDs.length;
    }

    /** @dev Sets the caller's choices for the specified votes.
     *  `O(n)` where
     *  `n` is the number of votes.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core.
     *  @param _voteIDs The IDs of the votes.
     *  @param _choice The choice.
     *  @param _salt The salt for the commit if the votes were hidden.
     */
    function castVote(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        uint256 _salt
    ) external notJumped(_coreDisputeID) {
        require(
            core.getCurrentPeriod(_coreDisputeID) == KlerosCore.Period.vote,
            "The dispute should be in Vote period."
        );
        require(_voteIDs.length > 0, "No voteID provided");

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        require(_choice <= dispute.numberOfChoices, "Choice out of bounds");

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        bool hiddenVotes = core.areVotesHidden(core.getSubcourtID(_coreDisputeID));

        //  Save the votes.
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(round.votes[_voteIDs[i]].account == msg.sender, "The caller has to own the vote.");
            require(
                !hiddenVotes || round.votes[_voteIDs[i]].commit == keccak256(abi.encodePacked(_choice, _salt)),
                "The commit must match the choice in subcourts with hidden votes."
            );
            require(!round.votes[_voteIDs[i]].voted, "Vote already cast.");
            round.votes[_voteIDs[i]].choice = _choice;
            round.votes[_voteIDs[i]].voted = true;
        }

        round.totalVoted += _voteIDs.length;

        round.counts[_choice] += _voteIDs.length;
        if (_choice == round.winningChoice) {
            if (round.tied) round.tied = false;
        } else {
            // Voted for another choice.
            if (round.counts[_choice] == round.counts[round.winningChoice]) {
                // Tie.
                if (!round.tied) round.tied = true;
            } else if (round.counts[_choice] > round.counts[round.winningChoice]) {
                // New winner.
                round.winningChoice = _choice;
                round.tied = false;
            }
        }
    }

    /** @dev Manages contributions, and appeals a dispute if at least two choices are fully funded.
     *  Note that the surplus deposit will be reimbursed.
     *  @param _coreDisputeID Index of the dispute in Kleros Core.
     *  @param _choice A choice that receives funding.
     */
    function fundAppeal(uint256 _coreDisputeID, uint256 _choice) external payable notJumped(_coreDisputeID) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        require(_choice <= dispute.numberOfChoices, "There is no such ruling to fund.");

        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = core.appealPeriod(_coreDisputeID);
        require(block.timestamp >= appealPeriodStart && block.timestamp < appealPeriodEnd, "Appeal period is over.");

        uint256 multiplier;
        if (this.currentRuling(_coreDisputeID) == _choice) {
            multiplier = WINNER_STAKE_MULTIPLIER;
        } else {
            require(
                block.timestamp - appealPeriodStart <
                    ((appealPeriodEnd - appealPeriodStart) * LOSER_APPEAL_PERIOD_MULTIPLIER) / ONE_BASIS_POINT,
                "Appeal period is over for loser"
            );
            multiplier = LOSER_STAKE_MULTIPLIER;
        }

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        require(!round.hasPaid[_choice], "Appeal fee is already paid.");
        uint256 appealCost = core.appealCost(_coreDisputeID);
        uint256 totalCost = appealCost + (appealCost * multiplier) / ONE_BASIS_POINT;

        // Take up to the amount necessary to fund the current round at the current costs.
        uint256 contribution;
        if (totalCost > round.paidFees[_choice]) {
            contribution = totalCost - round.paidFees[_choice] > msg.value // Overflows and underflows will be managed on the compiler level.
                ? msg.value
                : totalCost - round.paidFees[_choice];
            emit Contribution(_coreDisputeID, dispute.rounds.length - 1, _choice, msg.sender, contribution);
        }

        round.contributions[msg.sender][_choice] += contribution;
        round.paidFees[_choice] += contribution;
        if (round.paidFees[_choice] >= totalCost) {
            round.feeRewards += round.paidFees[_choice];
            round.fundedChoices.push(_choice);
            round.hasPaid[_choice] = true;
            emit ChoiceFunded(_coreDisputeID, dispute.rounds.length - 1, _choice);
        }

        if (round.fundedChoices.length > 1) {
            // At least two sides are fully funded.
            round.feeRewards = round.feeRewards - appealCost;

            // Don't create a new round in case of a jump, and remove local dispute from the flow.
            if (core.isDisputeKitJumping(_coreDisputeID)) {
                dispute.jumped = true;
            } else {
                // Don't subtract 1 from length since both round arrays haven't been updated yet.
                dispute.coreRoundIDToLocal[core.getNumberOfRounds(_coreDisputeID)] = dispute.rounds.length;

                Round storage newRound = dispute.rounds.push();
                newRound.tied = true;
            }
            core.appeal{value: appealCost}(_coreDisputeID, dispute.numberOfChoices, dispute.extraData);
        }

        if (msg.value > contribution) payable(msg.sender).send(msg.value - contribution);
    }

    /** @dev Allows those contributors who attempted to fund an appeal round to withdraw any reimbursable fees or rewards after the dispute gets resolved.
     *  @param _coreDisputeID Index of the dispute in Kleros Core contract.
     *  @param _beneficiary The address whose rewards to withdraw.
     *  @param _round The round the caller wants to withdraw from.
     *  @param _choice The ruling option that the caller wants to withdraw from.
     *  @return amount The withdrawn amount.
     */
    function withdrawFeesAndRewards(
        uint256 _coreDisputeID,
        address payable _beneficiary,
        uint256 _round,
        uint256 _choice
    ) external returns (uint256 amount) {
        require(core.isRuled(_coreDisputeID), "Dispute should be resolved.");

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[_round];
        uint256 finalRuling = core.currentRuling(_coreDisputeID);

        if (!round.hasPaid[_choice]) {
            // Allow to reimburse if funding was unsuccessful for this ruling option.
            amount = round.contributions[_beneficiary][_choice];
        } else {
            // Funding was successful for this ruling option.
            if (_choice == finalRuling) {
                // This ruling option is the ultimate winner.
                amount = round.paidFees[_choice] > 0
                    ? (round.contributions[_beneficiary][_choice] * round.feeRewards) / round.paidFees[_choice]
                    : 0;
            } else if (!round.hasPaid[finalRuling]) {
                // The ultimate winner was not funded in this round. In this case funded ruling option(s) are reimbursed.
                amount =
                    (round.contributions[_beneficiary][_choice] * round.feeRewards) /
                    (round.paidFees[round.fundedChoices[0]] + round.paidFees[round.fundedChoices[1]]);
            }
        }
        round.contributions[_beneficiary][_choice] = 0;

        if (amount != 0) {
            _beneficiary.send(amount); // Deliberate use of send to prevent reverting fallback. It's the user's responsibility to accept ETH.
            emit Withdrawal(_coreDisputeID, _round, _choice, _beneficiary, amount);
        }
    }

    /** @dev Submits evidence.
     *  @param _evidenceGroupID Unique identifier of the evidence group the evidence belongs to. It's the submitter responsability to submit the right evidence group ID.
     *  @param _evidence IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'.
     */
    function submitEvidence(uint256 _evidenceGroupID, string calldata _evidence) external {
        emit Evidence(core, _evidenceGroupID, msg.sender, _evidence);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /** @dev Gets the current ruling of a specified dispute.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core.
     *  @return ruling The current ruling.
     */
    function currentRuling(uint256 _coreDisputeID) external view override returns (uint256 ruling) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        ruling = round.tied ? 0 : round.winningChoice;
    }

    function getLastRoundResult(uint256 _coreDisputeID)
        external
        view
        override
        returns (uint256 winningChoiece, bool tied)
    {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage lastRound = dispute.rounds[dispute.rounds.length - 1];
        return (lastRound.winningChoice, lastRound.tied);
    }

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
    ) external view override returns (uint256) {
        // In this contract this degree can be either 0 or 1, but in other dispute kits this value can be something in between.
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        (uint256 winningChoice, bool tied) = core.getLastRoundResult(_coreDisputeID);

        if (vote.voted && (vote.choice == winningChoice || tied)) {
            return ONE_BASIS_POINT;
        } else {
            return 0;
        }
    }

    /** @dev Gets the number of jurors who are eligible to a reward in this round.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
     *  @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
     *  @return The number of coherent jurors.
     */
    function getCoherentCount(uint256 _coreDisputeID, uint256 _coreRoundID) external view override returns (uint256) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage currentRound = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]];
        (uint256 winningChoice, bool tied) = core.getLastRoundResult(_coreDisputeID);

        if (currentRound.totalVoted == 0 || (!tied && currentRound.counts[winningChoice] == 0)) {
            return 0;
        } else if (tied) {
            return currentRound.totalVoted;
        } else {
            return currentRound.counts[winningChoice];
        }
    }

    /** @dev Returns true if all of the jurors have cast their commits for the last round.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core.
     *  @return Whether all of the jurors have cast their commits for the last round.
     */
    function areCommitsAllCast(uint256 _coreDisputeID) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        return round.totalCommitted == round.votes.length;
    }

    /** @dev Returns true if all of the jurors have cast their votes for the last round.
     *  @param _coreDisputeID The ID of the dispute in Kleros Core.
     *  @return Whether all of the jurors have cast their votes for the last round.
     */
    function areVotesAllCast(uint256 _coreDisputeID) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        return round.totalVoted == round.votes.length;
    }

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
    ) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        return vote.voted;
    }

    function getRoundInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _choice
    )
        external
        view
        override
        returns (
            uint256 winningChoice,
            bool tied,
            uint256 totalVoted,
            uint256 totalCommited,
            uint256 nbVoters,
            uint256 choiceCount
        )
    {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]];
        return (
            round.winningChoice,
            round.tied,
            round.totalVoted,
            round.totalCommitted,
            round.votes.length,
            round.counts[_choice]
        );
    }

    function getVoteInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    )
        external
        view
        override
        returns (
            address account,
            bytes32 commit,
            uint256 choice,
            bool voted
        )
    {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        return (vote.account, vote.commit, vote.choice, vote.voted);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /** @dev Checks if an address belongs to the Proof of Humanity registry.
     *  @param _address The address to check.
     *  @return registered True if registered.
     */
    function proofOfHumanity(address _address) internal view returns (bool) {
        return poh.isRegistered(_address);
    }

    /** @dev RNG function
     *  @return rn A random number.
     */
    function getRandomNumber() internal returns (uint256) {
        return rng.getUncorrelatedRN(block.number);
    }

    /** @dev Retrieves a juror's address from the stake path ID.
     *  @param _stakePathID The stake path ID to unpack.
     *  @return account The account.
     */
    function stakePathIDToAccount(bytes32 _stakePathID) internal pure returns (address account) {
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
        }
    }
}
