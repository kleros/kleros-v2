// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {KlerosCore, KlerosCoreBase, IDisputeKit, ISortitionModule} from "../KlerosCore.sol";
import {Initializable} from "../../proxy/Initializable.sol";
import {UUPSProxiable} from "../../proxy/UUPSProxiable.sol";
import {SafeSend} from "../../libraries/SafeSend.sol";
import {ONE_BASIS_POINT, DISPUTE_KIT_CLASSIC} from "../../libraries/Constants.sol";

/// @title DisputeKitClassicBase
/// Abstract Dispute kit classic implementation of the Kleros v1 features including:
/// - a drawing system: proportional to staked PNK,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
abstract contract DisputeKitClassicBase is IDisputeKit, Initializable, UUPSProxiable {
    using SafeSend for address payable;

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
        mapping(uint256 choiceId => uint256) paidFees; // Tracks the fees paid for each choice in this round.
        mapping(uint256 choiceId => bool) hasPaid; // True if this choice was fully funded, false otherwise.
        mapping(address account => mapping(uint256 choiceId => uint256)) contributions; // Maps contributors to their contributions for each choice.
        uint256 feeRewards; // Sum of reimbursable appeal fees available to the parties that made contributions to the ruling that ultimately wins a dispute.
        uint256[] fundedChoices; // Stores the choices that are fully funded.
        uint256 nbVotes; // Maximal number of votes this dispute can get.
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

    address public owner; // The owner of the contract.
    KlerosCore public core; // The Kleros Core arbitrator
    Dispute[] public disputes; // Array of the locally created disputes.
    mapping(uint256 => uint256) public coreDisputeIDToLocal; // Maps the dispute ID in Kleros Core to the local dispute ID.
    bool public singleDrawPerJuror; // Whether each juror can only draw once per dispute, false by default.
    mapping(uint256 localDisputeID => mapping(uint256 localRoundID => mapping(address drawnAddress => bool)))
        public alreadyDrawn; // True if the address has already been drawn, false by default. To be added to the Round struct when fully redeploying rather than upgrading.
    mapping(uint256 coreDisputeID => bool) public coreDisputeIDToActive; // True if this dispute kit is active for this core dispute ID.
    address public wNative; // The wrapped native token for safeSend().
    uint256 public jumpDisputeKitID; // The ID of the dispute kit in Kleros Core disputeKits array that the dispute should switch to after the court jump, in case the new court doesn't support this dispute kit.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev To be emitted when a dispute is created.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _numberOfChoices The number of choices available in the dispute.
    /// @param _extraData The extra data for the dispute.
    event DisputeCreation(uint256 indexed _coreDisputeID, uint256 _numberOfChoices, bytes _extraData);

    /// @dev To be emitted when a vote commitment is cast.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _juror The address of the juror casting the vote commitment.
    /// @param _voteIDs The identifiers of the votes in the dispute.
    /// @param _commit The commitment of the juror.
    event CommitCast(uint256 indexed _coreDisputeID, address indexed _juror, uint256[] _voteIDs, bytes32 _commit);

    /// @dev To be emitted when a funding contribution is made.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _coreRoundID The identifier of the round in the Arbitrator contract.
    /// @param _choice The choice that is being funded.
    /// @param _contributor The address of the contributor.
    /// @param _amount The amount contributed.
    event Contribution(
        uint256 indexed _coreDisputeID,
        uint256 indexed _coreRoundID,
        uint256 _choice,
        address indexed _contributor,
        uint256 _amount
    );

    /// @dev To be emitted when the contributed funds are withdrawn.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _coreRoundID The identifier of the round in the Arbitrator contract.
    /// @param _choice The choice that is being funded.
    /// @param _contributor The address of the contributor.
    /// @param _amount The amount withdrawn.
    event Withdrawal(
        uint256 indexed _coreDisputeID,
        uint256 indexed _coreRoundID,
        uint256 _choice,
        address indexed _contributor,
        uint256 _amount
    );

    /// @dev To be emitted when a choice is fully funded for an appeal.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _coreRoundID The identifier of the round in the Arbitrator contract.
    /// @param _choice The choice that is being funded.
    event ChoiceFunded(uint256 indexed _coreDisputeID, uint256 indexed _coreRoundID, uint256 indexed _choice);

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    modifier onlyByCore() {
        if (address(core) != msg.sender) revert KlerosCoreOnly();
        _;
    }

    modifier notJumped(uint256 _coreDisputeID) {
        if (disputes[coreDisputeIDToLocal[_coreDisputeID]].jumped) revert DisputeJumpedToParentDK();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Initializer.
    /// @param _owner The owner's address.
    /// @param _core The KlerosCore arbitrator.
    /// @param _wNative The wrapped native token address, typically wETH.
    /// @param _jumpDisputeKitID The ID of the dispute kit to switch to after the court jump.
    function __DisputeKitClassicBase_initialize(
        address _owner,
        KlerosCore _core,
        address _wNative,
        uint256 _jumpDisputeKitID
    ) internal onlyInitializing {
        owner = _owner;
        core = _core;
        wNative = _wNative;
        jumpDisputeKitID = _jumpDisputeKitID;
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    /// @dev Allows the owner to call anything on behalf of the contract.
    /// @param _destination The destination of the call.
    /// @param _amount The value sent with the call.
    /// @param _data The data sent with the call.
    function executeOwnerProposal(address _destination, uint256 _amount, bytes memory _data) external onlyByOwner {
        (bool success, ) = _destination.call{value: _amount}(_data);
        if (!success) revert UnsuccessfulCall();
    }

    /// @dev Changes the `owner` storage variable.
    /// @param _owner The new value for the `owner` storage variable.
    function changeOwner(address payable _owner) external onlyByOwner {
        owner = _owner;
    }

    /// @dev Changes the `core` storage variable.
    /// @param _core The new value for the `core` storage variable.
    function changeCore(address _core) external onlyByOwner {
        core = KlerosCore(_core);
    }

    /// @dev Changes the dispute kit ID used for the jump.
    /// @param _jumpDisputeKitID The new value for the `jumpDisputeKitID` storage variable.
    function changeJumpDisputeKitID(uint256 _jumpDisputeKitID) external onlyByOwner {
        jumpDisputeKitID = _jumpDisputeKitID;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Creates a local dispute and maps it to the dispute ID in the Core contract.
    /// Note: Access restricted to Kleros Core only.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _numberOfChoices Number of choices of the dispute
    /// @param _extraData Additional info about the dispute, for possible use in future dispute kits.
    /// @param _nbVotes Number of votes for this dispute.
    function createDispute(
        uint256 _coreDisputeID,
        uint256 _numberOfChoices,
        bytes calldata _extraData,
        uint256 _nbVotes
    ) external override onlyByCore {
        uint256 localDisputeID = disputes.length;
        Dispute storage dispute = disputes.push();
        dispute.numberOfChoices = _numberOfChoices;
        dispute.extraData = _extraData;
        dispute.jumped = false; // Possibly true if this DK has jumped in a previous round.

        // New round in the Core should be created before the dispute creation in DK.
        dispute.coreRoundIDToLocal[core.getNumberOfRounds(_coreDisputeID) - 1] = dispute.rounds.length;

        Round storage round = dispute.rounds.push();
        round.nbVotes = _nbVotes;
        round.tied = true;

        coreDisputeIDToLocal[_coreDisputeID] = localDisputeID;
        coreDisputeIDToActive[_coreDisputeID] = true;
        emit DisputeCreation(_coreDisputeID, _numberOfChoices, _extraData);
    }

    /// @dev Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
    /// Note: Access restricted to Kleros Core only.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _nonce Nonce of the drawing iteration.
    /// @return drawnAddress The drawn address.
    function draw(
        uint256 _coreDisputeID,
        uint256 _nonce
    ) external override onlyByCore notJumped(_coreDisputeID) returns (address drawnAddress, uint96 fromSubcourtID) {
        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        uint256 localRoundID = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[localRoundID];

        ISortitionModule sortitionModule = core.sortitionModule();
        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        (drawnAddress, fromSubcourtID) = sortitionModule.draw(courtID, _coreDisputeID, _nonce);
        if (drawnAddress == address(0)) {
            // Sortition can return 0 address if no one has staked yet.
            return (drawnAddress, fromSubcourtID);
        }

        if (_postDrawCheck(round, _coreDisputeID, drawnAddress)) {
            round.votes.push(Vote({account: drawnAddress, commit: bytes32(0), choice: 0, voted: false}));
            alreadyDrawn[localDisputeID][localRoundID][drawnAddress] = true;
        } else {
            drawnAddress = address(0);
        }
    }

    /// @dev Sets the caller's commit for the specified votes. It can be called multiple times during the
    /// commit period, each call overrides the commits of the previous one.
    /// `O(n)` where
    /// `n` is the number of votes.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _commit The commitment hash.
    function castCommit(uint256 _coreDisputeID, uint256[] calldata _voteIDs, bytes32 _commit) external {
        _castCommit(_coreDisputeID, _voteIDs, _commit);
    }

    function _castCommit(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes32 _commit
    ) internal notJumped(_coreDisputeID) {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        if (period != KlerosCoreBase.Period.commit) revert NotCommitPeriod();
        if (_commit == bytes32(0)) revert EmptyCommit();
        if (!coreDisputeIDToActive[_coreDisputeID]) revert NotActiveForCoreDisputeID();

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            if (round.votes[_voteIDs[i]].account != msg.sender) revert JurorHasToOwnTheVote();
            round.votes[_voteIDs[i]].commit = _commit;
        }
        round.totalCommitted += _voteIDs.length;
        emit CommitCast(_coreDisputeID, msg.sender, _voteIDs, _commit);
    }

    /// @dev Sets the caller's choices for the specified votes.
    /// `O(n)` where
    /// `n` is the number of votes.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _choice The choice.
    /// @param _salt The salt for the commit if the votes were hidden.
    /// @param _justification Justification of the choice.
    function castVote(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        uint256 _salt,
        string memory _justification
    ) external {
        _castVote(_coreDisputeID, _voteIDs, _choice, _salt, _justification, msg.sender);
    }

    function _castVote(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        uint256 _choice,
        uint256 _salt,
        string memory _justification,
        address _juror
    ) internal notJumped(_coreDisputeID) {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        if (period != KlerosCoreBase.Period.vote) revert NotVotePeriod();
        if (_voteIDs.length == 0) revert EmptyVoteIDs();
        if (!coreDisputeIDToActive[_coreDisputeID]) revert NotActiveForCoreDisputeID();

        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        if (_choice > dispute.numberOfChoices) revert ChoiceOutOfBounds();

        uint256 localRoundID = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[localRoundID];
        {
            (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
            (, bool hiddenVotes, , , , , ) = core.courts(courtID);
            bytes32 actualVoteHash = hashVote(_choice, _salt, _justification);

            //  Save the votes.
            for (uint256 i = 0; i < _voteIDs.length; i++) {
                if (round.votes[_voteIDs[i]].account != _juror) revert JurorHasToOwnTheVote();
                if (hiddenVotes && _getExpectedVoteHash(localDisputeID, localRoundID, _voteIDs[i]) != actualVoteHash)
                    revert HashDoesNotMatchHiddenVoteCommitment();
                if (round.votes[_voteIDs[i]].voted) revert VoteAlreadyCast();
                round.votes[_voteIDs[i]].choice = _choice;
                round.votes[_voteIDs[i]].voted = true;
            }
        } // Workaround stack too deep

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
        emit VoteCast(_coreDisputeID, _juror, _voteIDs, _choice, _justification);
    }

    /// @dev Manages contributions, and appeals a dispute if at least two choices are fully funded.
    /// Note that the surplus deposit will be reimbursed.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _choice A choice that receives funding.
    function fundAppeal(uint256 _coreDisputeID, uint256 _choice) external payable notJumped(_coreDisputeID) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        if (_choice > dispute.numberOfChoices) revert ChoiceOutOfBounds();
        if (!coreDisputeIDToActive[_coreDisputeID]) revert NotActiveForCoreDisputeID();

        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = core.appealPeriod(_coreDisputeID);
        if (block.timestamp < appealPeriodStart || block.timestamp >= appealPeriodEnd) revert AppealPeriodIsOver();

        uint256 multiplier;
        (uint256 ruling, , ) = this.currentRuling(_coreDisputeID);
        if (ruling == _choice) {
            multiplier = WINNER_STAKE_MULTIPLIER;
        } else {
            if (
                block.timestamp - appealPeriodStart >=
                ((appealPeriodEnd - appealPeriodStart) * LOSER_APPEAL_PERIOD_MULTIPLIER) / ONE_BASIS_POINT
            ) {
                revert AppealPeriodIsOverForLoser();
            }
            multiplier = LOSER_STAKE_MULTIPLIER;
        }

        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        uint256 coreRoundID = core.getNumberOfRounds(_coreDisputeID) - 1;

        if (round.hasPaid[_choice]) revert AppealFeeIsAlreadyPaid();
        uint256 appealCost = core.appealCost(_coreDisputeID);
        uint256 totalCost = appealCost + (appealCost * multiplier) / ONE_BASIS_POINT;

        // Take up to the amount necessary to fund the current round at the current costs.
        uint256 contribution;
        if (totalCost > round.paidFees[_choice]) {
            contribution = totalCost - round.paidFees[_choice] > msg.value // Overflows and underflows will be managed on the compiler level.
                ? msg.value
                : totalCost - round.paidFees[_choice];
            emit Contribution(_coreDisputeID, coreRoundID, _choice, msg.sender, contribution);
        }

        round.contributions[msg.sender][_choice] += contribution;
        round.paidFees[_choice] += contribution;
        if (round.paidFees[_choice] >= totalCost) {
            round.feeRewards += round.paidFees[_choice];
            round.fundedChoices.push(_choice);
            round.hasPaid[_choice] = true;
            emit ChoiceFunded(_coreDisputeID, coreRoundID, _choice);
        }

        if (round.fundedChoices.length > 1) {
            // At least two sides are fully funded.
            round.feeRewards = round.feeRewards - appealCost;

            if (core.isDisputeKitJumping(_coreDisputeID)) {
                // Don't create a new round in case of a jump, and remove local dispute from the flow.
                dispute.jumped = true;
            } else {
                // Don't subtract 1 from length since both round arrays haven't been updated yet.
                dispute.coreRoundIDToLocal[coreRoundID + 1] = dispute.rounds.length;

                Round storage newRound = dispute.rounds.push();
                newRound.nbVotes = core.getNumberOfVotes(_coreDisputeID);
                newRound.tied = true;
            }
            core.appeal{value: appealCost}(_coreDisputeID, dispute.numberOfChoices, dispute.extraData);
        }

        if (msg.value > contribution) payable(msg.sender).safeSend(msg.value - contribution, wNative);
    }

    /// @dev Allows those contributors who attempted to fund an appeal round to withdraw any reimbursable fees or rewards after the dispute gets resolved.
    /// Note that withdrawals are not possible if the core contract is paused.
    /// @param _coreDisputeID Index of the dispute in Kleros Core contract.
    /// @param _beneficiary The address whose rewards to withdraw.
    /// @param _coreRoundID The round in the Kleros Core contract the caller wants to withdraw from.
    /// @param _choice The ruling option that the caller wants to withdraw from.
    /// @return amount The withdrawn amount.
    function withdrawFeesAndRewards(
        uint256 _coreDisputeID,
        address payable _beneficiary,
        uint256 _coreRoundID,
        uint256 _choice
    ) external returns (uint256 amount) {
        (, , , bool isRuled, ) = core.disputes(_coreDisputeID);
        if (!isRuled) revert DisputeNotResolved();
        if (core.paused()) revert CoreIsPaused();
        if (!coreDisputeIDToActive[_coreDisputeID]) revert NotActiveForCoreDisputeID();

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]];
        (uint256 finalRuling, , ) = core.currentRuling(_coreDisputeID);

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
            _beneficiary.safeSend(amount, wNative);
            emit Withdrawal(_coreDisputeID, _coreRoundID, _choice, _beneficiary, amount);
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /**
     * @dev Computes the hash of a vote using ABI encoding
     * @dev The unused parameters may be used by overriding contracts.
     * @param _choice The choice being voted for
     * @param _salt A random salt for commitment
     * @return bytes32 The hash of the encoded vote parameters
     */
    function hashVote(
        uint256 _choice,
        uint256 _salt,
        string memory /*_justification*/
    ) public view virtual returns (bytes32) {
        return keccak256(abi.encodePacked(_choice, _salt));
    }

    function getFundedChoices(uint256 _coreDisputeID) public view returns (uint256[] memory fundedChoices) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage lastRound = dispute.rounds[dispute.rounds.length - 1];
        return lastRound.fundedChoices;
    }

    /// @dev Gets the current ruling of a specified dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(
        uint256 _coreDisputeID
    ) external view override returns (uint256 ruling, bool tied, bool overridden) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        tied = round.tied;
        ruling = tied ? 0 : round.winningChoice;
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        // Override the final ruling if only one side funded the appeals.
        if (period == KlerosCoreBase.Period.execution) {
            uint256[] memory fundedChoices = getFundedChoices(_coreDisputeID);
            if (fundedChoices.length == 1) {
                ruling = fundedChoices[0];
                tied = false;
                overridden = true;
            }
        }
    }

    /// @dev Gets the degree of coherence of a particular voter. This function is called by Kleros Core in order to determine the amount of the reward.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @return pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    /// @return feeCoherence The degree of coherence in basis points for the dispute fee reward.
    function getDegreeOfCoherenceReward(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 /* _feePerJuror */,
        uint256 /* _pnkAtStakePerJuror */
    ) external view override returns (uint256 pnkCoherence, uint256 feeCoherence) {
        uint256 coherence = _getDegreeOfCoherence(_coreDisputeID, _coreRoundID, _voteID);
        return (coherence, coherence);
    }

    /// @dev Gets the degree of coherence of a particular voter. This function is called by Kleros Core in order to determine the amount of the penalty.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @return pnkCoherence The degree of coherence in basis points for the dispute PNK reward.
    function getDegreeOfCoherencePenalty(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 /* _feePerJuror */,
        uint256 /* _pnkAtStakePerJuror */
    ) external view override returns (uint256 pnkCoherence) {
        return _getDegreeOfCoherence(_coreDisputeID, _coreRoundID, _voteID);
    }

    function _getDegreeOfCoherence(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) internal view returns (uint256 coherence) {
        // In this contract this degree can be either 0 or 1, but in other dispute kits this value can be something in between.
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        (uint256 winningChoice, bool tied, ) = core.currentRuling(_coreDisputeID);

        if (vote.voted && (vote.choice == winningChoice || tied)) {
            return ONE_BASIS_POINT;
        } else {
            return 0;
        }
    }

    /// @dev Gets the number of jurors who are eligible to a reward in this round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @return The number of coherent jurors.
    function getCoherentCount(uint256 _coreDisputeID, uint256 _coreRoundID) external view override returns (uint256) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage currentRound = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]];
        (uint256 winningChoice, bool tied, ) = core.currentRuling(_coreDisputeID);

        if (currentRound.totalVoted == 0 || (!tied && currentRound.counts[winningChoice] == 0)) {
            return 0;
        } else if (tied) {
            return currentRound.totalVoted;
        } else {
            return currentRound.counts[winningChoice];
        }
    }

    /// @dev Returns true if all of the jurors have cast their commits for the last round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether all of the jurors have cast their commits for the last round.
    function areCommitsAllCast(uint256 _coreDisputeID) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        return round.totalCommitted == round.votes.length;
    }

    /// @dev Returns true if all of the jurors have cast their votes for the last round.
    /// Note that this function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether all of the jurors have cast their votes for the last round.
    function areVotesAllCast(uint256 _coreDisputeID) external view override returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];

        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        (, bool hiddenVotes, , , , , ) = core.courts(courtID);
        uint256 expectedTotalVoted = hiddenVotes ? round.totalCommitted : round.votes.length;

        return round.totalVoted == expectedTotalVoted;
    }

    /// @dev Returns true if the appeal funding is finished prematurely (e.g. when losing side didn't fund).
    /// Note that this function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @return Whether the appeal funding is finished.
    function isAppealFunded(uint256 _coreDisputeID) external view override returns (bool) {
        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = core.appealPeriod(_coreDisputeID);

        uint256[] memory fundedChoices = getFundedChoices(_coreDisputeID);
        // Uses block.timestamp from the current tx when called by the core contract.
        return (fundedChoices.length == 0 &&
            block.timestamp - appealPeriodStart >=
            ((appealPeriodEnd - appealPeriodStart) * LOSER_APPEAL_PERIOD_MULTIPLIER) / ONE_BASIS_POINT);
    }

    /// @dev Returns true if the dispute is jumping to a parent court.
    /// @return Whether the dispute is jumping to a parent court or not.
    function earlyCourtJump(uint256 /* _coreDisputeID */) external pure override returns (bool) {
        return false;
    }

    /// @dev Returns the number of votes after the appeal.
    /// @param _currentNbVotes The number of votes before the appeal.
    /// @return The number of votes after the appeal.
    function getNbVotesAfterAppeal(
        IDisputeKit /* _previousDisputeKit */,
        uint256 _currentNbVotes
    ) external pure override returns (uint256) {
        return (_currentNbVotes * 2) + 1;
    }

    /// @dev Returns the dispute kid ID be used after court jump by Kleros Core.
    /// @return The ID of the dispute kit in Kleros Core disputeKits array.
    function getJumpDisputeKitID() external view override returns (uint256) {
        // Fall back to classic DK in case the jump ID is not defined.
        return jumpDisputeKitID == 0 ? DISPUTE_KIT_CLASSIC : jumpDisputeKitID;
    }

    /// @dev Returns true if the specified voter was active in this round.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core, not in the Dispute Kit.
    /// @param _coreRoundID The ID of the round in Kleros Core, not in the Dispute Kit.
    /// @param _voteID The ID of the voter.
    /// @return Whether the voter was active or not.
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

    /// @dev Returns the number of rounds in a dispute.
    /// @param _localDisputeID The ID of the dispute in the Dispute Kit.
    /// @return The number of rounds in the dispute.
    function getNumberOfRounds(uint256 _localDisputeID) external view returns (uint256) {
        return disputes[_localDisputeID].rounds.length;
    }

    /// @dev Returns the local dispute ID and round ID for a given core dispute ID and core round ID.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @return localDisputeID The ID of the dispute in the Dispute Kit.
    /// @return localRoundID The ID of the round in the Dispute Kit.
    function getLocalDisputeRoundID(
        uint256 _coreDisputeID,
        uint256 _coreRoundID
    ) external view returns (uint256 localDisputeID, uint256 localRoundID) {
        localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        localRoundID = disputes[localDisputeID].coreRoundIDToLocal[_coreRoundID];
    }

    /// @dev Returns the vote information for a given vote ID.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @return account The address of the juror who cast the vote.
    /// @return commit The commit of the vote.
    function getVoteInfo(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID
    ) external view override returns (address account, bytes32 commit, uint256 choice, bool voted) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        return (vote.account, vote.commit, vote.choice, vote.voted);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    /// @dev Returns the expected vote hash for a given vote.
    /// @param _localDisputeID The ID of the dispute in the Dispute Kit.
    /// @param _localRoundID The ID of the round in the Dispute Kit.
    /// @param _voteID The ID of the vote.
    /// @return The expected vote hash.
    function _getExpectedVoteHash(
        uint256 _localDisputeID,
        uint256 _localRoundID,
        uint256 _voteID
    ) internal view virtual returns (bytes32) {
        return disputes[_localDisputeID].rounds[_localRoundID].votes[_voteID].commit;
    }

    /// @dev Checks that the chosen address satisfies certain conditions for being drawn.
    /// Note that we don't check the minStake requirement here because of the implicit staking in parent courts.
    /// minStake is checked directly during staking process however it's possible for the juror to get drawn
    /// while having < minStake if it is later increased by governance.
    /// This issue is expected and harmless.
    /// @param _coreDisputeID ID of the dispute in the core contract.
    /// @param _juror Chosen address.
    /// @return result Whether the address passes the check or not.
    function _postDrawCheck(
        Round storage /*_round*/,
        uint256 _coreDisputeID,
        address _juror
    ) internal view virtual returns (bool result) {
        if (singleDrawPerJuror) {
            uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
            Dispute storage dispute = disputes[localDisputeID];
            uint256 localRoundID = dispute.rounds.length - 1;
            result = !alreadyDrawn[localDisputeID][localRoundID][_juror];
        } else {
            result = true;
        }
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error KlerosCoreOnly();
    error DisputeJumpedToParentDK();
    error UnsuccessfulCall();
    error NotCommitPeriod();
    error EmptyCommit();
    error NotActiveForCoreDisputeID();
    error JurorHasToOwnTheVote();
    error NotVotePeriod();
    error EmptyVoteIDs();
    error ChoiceOutOfBounds();
    error HashDoesNotMatchHiddenVoteCommitment();
    error VoteAlreadyCast();
    error AppealPeriodIsOver();
    error AppealPeriodIsOverForLoser();
    error AppealFeeIsAlreadyPaid();
    error DisputeNotResolved();
    error CoreIsPaused();
}
