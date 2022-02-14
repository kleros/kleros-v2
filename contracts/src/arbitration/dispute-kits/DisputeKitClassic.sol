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

/**
 *  @title DisputeKitClassic
 *  Dispute kit implementation of the Kleros v1 features including:
 *  - a drawing system: proportional to staked PNK,
 *  - a vote aggreation system: plurality,
 *  - an incentive system: equal split between coherent votes,
 *  - an appeal system: fund 2 choices only, vote on any choice.
 *  TODO:
 *  - phase management: Generating->Drawing->Resolving->Generating in coordination with KlerosCore to freeze staking.
 */
contract DisputeKitClassic is BaseDisputeKit {
    // ************************************* //
    // *             Structs               * //
    // ************************************* //

    enum Phase {
        resolving, // No disputes that need drawing.
        generating, // Waiting for a random number. Pass as soon as it is ready.
        drawing // Jurors can be drawn.
    }

    struct Dispute {
        Round[] rounds; // Rounds of the dispute. 0 is the default round, and [1, ..n] are the appeal rounds.
        uint256 numberOfChoices; // The number of choices jurors have when voting. This does not include choice `0` which is reserved for "refuse to arbitrate".
        uint256 nbVotes; // Maximal number of votes this dispute can get.
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

    RNG public rng; // The random number generator.
    uint256 public RNBlock; // The block number when the random number was requested.
    uint256 public RN; // The current random number.

    Phase public phase; // Current phase of this dispute kit.
    uint256 public disputesWithoutJurors; // The number of disputes that have not finished drawing jurors.

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
    event NewPhaseDisputeKit(Phase _phase);

    /** @dev Constructor.
     *  @param _governor The governor's address.
     *  @param _core The KlerosCore arbitrator.
     *  @param _rng The random number generator.
     */
    constructor(
        address _governor,
        KlerosCore _core,
        RNG _rng
    ) BaseDisputeKit(_governor, _core) {
        rng = _rng;
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
    function changeCore(address payable _core) external onlyByGovernor {
        core = KlerosCore(_core);
    }

    /** @dev Changes the `_rng` storage variable.
     *  @param _rng The new value for the `RNGenerator` storage variable.
     */
    function changeRandomNumberGenerator(RNG _rng) external onlyByGovernor {
        rng = _rng;
        // TODO: if current phase is generating, call rng.requestRN() for the next block
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /** @dev Creates a local dispute and maps it to the dispute ID in the Core contract.
     *  Note: Access restricted to Kleros Core only.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @param _numberOfChoices Number of choices of the dispute
     *  @param _extraData Additional info about the dispute, for possible use in future dispute kits.
     *  @param _nbVotes Number of votes for this dispute.
     */
    function createDispute(
        uint256 _disputeID,
        uint256 _numberOfChoices,
        bytes calldata _extraData,
        uint256 _nbVotes
    ) external override onlyByCore {
        uint256 localDisputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.numberOfChoices = _numberOfChoices;
        dispute.nbVotes = _nbVotes;

        Round storage round = dispute.rounds.push();
        round.tied = true;

        coreDisputeIDToLocal[_disputeID] = localDisputeID;
        disputesWithoutJurors++;
    }

    /** @dev Passes the phase.
     */
    function passPhase() external {
        require(core.allowSwitchPhase(), "Switching is not allowed");
        if (phase == Phase.resolving) {
            require(disputesWithoutJurors > 0, "There are no disputes that need jurors.");
            require(block.number >= core.getFreezeBlock() + 20);
            // TODO: RNG process is currently unfinished.
            RNBlock = block.number;
            rng.requestRN(block.number);
            phase = Phase.generating;
        } else if (phase == Phase.generating) {
            RN = rng.getRN(RNBlock);
            require(RN != 0, "Random number is not ready yet.");
            phase = Phase.drawing;
        } else if (phase == Phase.drawing) {
            require(core.dKCanBeResolved(), "Max freezing time has not passed yet.");
            phase = Phase.resolving;
        }
        emit NewPhaseDisputeKit(phase);
    }

    /** @dev Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
     *  Note: Access restricted to Kleros Core only.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @return drawnAddress The drawn address.
     */
    function draw(uint256 _disputeID) external override onlyByCore returns (address drawnAddress) {
        require(phase == Phase.drawing, "Should be in drawing phase");
        bytes32 key = bytes32(core.getSubcourtID(_disputeID)); // Get the ID of the tree.
        uint256 drawnNumber = getRandomNumber();

        (uint256 K, , uint256[] memory nodes) = core.getSortitionSumTree(key);
        uint256 treeIndex = 0;
        uint256 currentDrawnNumber = drawnNumber % nodes[0];

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
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

        if (postDrawCheck(_disputeID, drawnAddress)) {
            round.votes.push(Vote({account: drawnAddress, commit: bytes32(0), choice: 0, voted: false}));
            if (round.votes.length == dispute.nbVotes) {
                disputesWithoutJurors--;
                // TODO: Refactor KlerosCore and DK to switch the phase in more centralized way.
                // Note that as of now DisputeKit that has all disputes drawn is deleted from activeDisputeKits in KC, so its phase can't be switched there.
                if (disputesWithoutJurors == 0) phase = Phase.resolving;
            }
        } else {
            drawnAddress = address(0);
        }
    }

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
    ) external {
        require(
            core.getCurrentPeriod(_disputeID) == KlerosCore.Period.commit,
            "The dispute should be in Commit period."
        );
        require(_commit != bytes32(0), "Empty commit.");

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(round.votes[_voteIDs[i]].account == msg.sender, "The caller has to own the vote.");
            require(round.votes[_voteIDs[i]].commit == bytes32(0), "Already committed this vote.");
            round.votes[_voteIDs[i]].commit = _commit;
        }
        round.totalCommitted += _voteIDs.length;

        if (round.totalCommitted == round.votes.length) core.passPeriod(_disputeID);
    }

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
    ) external {
        require(core.getCurrentPeriod(_disputeID) == KlerosCore.Period.vote, "The dispute should be in Vote period.");
        require(_voteIDs.length > 0, "No voteID provided");

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        require(_choice <= dispute.numberOfChoices, "Choice out of bounds");

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        bool hiddenVotes = core.areVotesHidden(core.getSubcourtID(_disputeID));

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

        // Automatically switch period when voting is finished.
        if (round.totalVoted == round.votes.length) core.passPeriod(_disputeID);
    }

    /** @dev Manages contributions, and appeals a dispute if at least two choices are fully funded.
     *  Note that the surplus deposit will be reimbursed.
     *  @param _disputeID Index of the dispute in Kleros Core contract.
     *  @param _choice A choice that receives funding.
     */
    function fundAppeal(uint256 _disputeID, uint256 _choice) external payable {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        require(_choice <= dispute.numberOfChoices, "There is no such ruling to fund.");

        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = core.appealPeriod(_disputeID);
        require(block.timestamp >= appealPeriodStart && block.timestamp < appealPeriodEnd, "Appeal period is over.");

        uint256 multiplier;
        if (this.currentRuling(_disputeID) == _choice) {
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
        uint256 appealCost = core.appealCost(_disputeID);
        uint256 totalCost = appealCost + (appealCost * multiplier) / ONE_BASIS_POINT;

        // Take up to the amount necessary to fund the current round at the current costs.
        uint256 contribution;
        if (totalCost > round.paidFees[_choice]) {
            contribution = totalCost - round.paidFees[_choice] > msg.value // Overflows and underflows will be managed on the compiler level.
                ? msg.value
                : totalCost - round.paidFees[_choice];
            emit Contribution(_disputeID, dispute.rounds.length - 1, _choice, msg.sender, contribution);
        }

        round.contributions[msg.sender][_choice] += contribution;
        round.paidFees[_choice] += contribution;
        if (round.paidFees[_choice] >= totalCost) {
            round.feeRewards += round.paidFees[_choice];
            round.fundedChoices.push(_choice);
            round.hasPaid[_choice] = true;
            emit ChoiceFunded(_disputeID, dispute.rounds.length - 1, _choice);
        }

        if (round.fundedChoices.length > 1) {
            // At least two sides are fully funded.
            round.feeRewards = round.feeRewards - appealCost;

            Round storage newRound = dispute.rounds.push();
            newRound.tied = true;
            disputesWithoutJurors++;
            core.appeal{value: appealCost}(_disputeID);
            dispute.nbVotes = core.getNumberOfVotes(_disputeID);
        }

        if (msg.value > contribution) payable(msg.sender).send(msg.value - contribution);
    }

    /** @dev Allows those contributors who attempted to fund an appeal round to withdraw any reimbursable fees or rewards after the dispute gets resolved.
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
    ) external returns (uint256 amount) {
        require(core.isRuled(_disputeID), "Dispute should be resolved.");

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        Round storage round = dispute.rounds[_round];
        uint256 finalRuling = this.currentRuling(_disputeID);

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
            emit Withdrawal(_disputeID, _round, _choice, _beneficiary, amount);
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /** @dev Gets the current ruling of a specified dispute.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @return ruling The current ruling.
     */
    function currentRuling(uint256 _disputeID) external view override returns (uint256 ruling) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        ruling = round.tied ? 0 : round.winningChoice;
    }

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
    ) external view override returns (uint256) {
        // In this contract this degree can be either 0 or 1, but in other dispute kits this value can be something in between.
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        Round storage lastRound = dispute.rounds[dispute.rounds.length - 1];
        Vote storage vote = dispute.rounds[_round].votes[_voteID];

        if (vote.voted && (vote.choice == lastRound.winningChoice || lastRound.tied)) {
            return ONE_BASIS_POINT;
        } else {
            return 0;
        }
    }

    /** @dev Gets the number of jurors who are eligible to a reward in this round.
     *  @param _disputeID The ID of the dispute in Kleros Core.
     *  @param _round The ID of the round.
     *  @return The number of coherent jurors.
     */
    function getCoherentCount(uint256 _disputeID, uint256 _round) external view override returns (uint256) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        Round storage lastRound = dispute.rounds[dispute.rounds.length - 1];
        Round storage currentRound = dispute.rounds[_round];
        uint256 winningChoice = lastRound.winningChoice;

        if (currentRound.totalVoted == 0 || (!lastRound.tied && currentRound.counts[winningChoice] == 0)) {
            return 0;
        } else if (lastRound.tied) {
            return currentRound.totalVoted;
        } else {
            return currentRound.counts[winningChoice];
        }
    }

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
    ) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        Vote storage vote = dispute.rounds[_round].votes[_voteID];
        return vote.voted;
    }

    function getRoundInfo(
        uint256 _disputeID,
        uint256 _round,
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
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        Round storage round = dispute.rounds[_round];
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
        uint256 _disputeID,
        uint256 _round,
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
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_disputeID]];
        Vote storage vote = dispute.rounds[_round].votes[_voteID];
        return (vote.account, vote.commit, vote.choice, vote.voted);
    }

    function onCoreFreezingPhase() external onlyByCore {
        phase = Phase.resolving;
    }

    function readyForStaking() external view returns (bool) {
        return phase == Phase.resolving;
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function postDrawCheck(uint256 _disputeID, address _juror) internal view override returns (bool) {
        uint256 subcourtID = core.getSubcourtID(_disputeID);
        (uint256 stakedTokens, uint256 lockedTokens) = core.getJurorBalance(_juror, uint96(subcourtID));
        return stakedTokens >= lockedTokens;
    }

    /** @dev RNG function
     *  @return rn A random number.
     */
    function getRandomNumber() internal returns (uint256) {
        return rng.getUncorrelatedRN(RNBlock);
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
