// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IDisputeKit} from "../interfaces/IDisputeKit.sol";
import {ISortitionModule} from "../interfaces/ISortitionModule.sol";
import {SafeSend} from "../../libraries/SafeSend.sol";
import {ONE_BASIS_POINT} from "../../libraries/Constants.sol";
import {KlerosCore} from "../KlerosCore.sol";
import {ICourtEligibility} from "../interfaces/ICourtEligibility.sol";

interface IBalanceHolder {
    /// @notice Returns the number of tokens in `owner` account.
    /// @dev Compatible with ERC-20 and ERC-721.
    /// @param owner The address of the owner.
    /// @return balance The number of tokens in `owner` account.
    function balanceOf(address owner) external view returns (uint256 balance);
}

/// @title DisputeKitGatedArgentinaConsumerProtection
/// @notice Dispute kit implementation adapted from DisputeKitClassic
/// - a drawing system: proportional to staked PNK among the jurors holding a `accreditedProfessionalToken` or a `accreditedConsumerProtectionLawyerToken`
///   and at least one of the drawn jurors is holding a `accreditedConsumerProtectionLawyerToken`,
/// - a vote aggregation system: plurality,
/// - an incentive system: equal split between coherent votes,
/// - an appeal system: fund 2 choices only, vote on any choice.
contract DisputeKitGatedArgentinaConsumerProtection is IDisputeKit, Initializable, ICourtEligibility {
    using SafeSend for address payable;

    // ************************************* //
    // *             Structs               * //
    // ************************************* //

    struct Dispute {
        Round[] rounds; // Rounds of the dispute. 0 is the default round, and [1, ..n] are the appeal rounds.
        uint256 numberOfChoices; // The number of choices jurors have when voting. This does not include choice `0` which is reserved for "refuse to arbitrate".
        mapping(uint256 => uint256) coreRoundIDToLocal; // Maps id of the round in the core contract to the index of the round of related local dispute.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct Round {
        Vote[] votes; // Stores the votes cast in this round. Former votes[_appeal][].
        uint256 winningChoice; // The choice with the most votes. Note that in the case of a tie, it is the choice that reached the tied number of votes first.
        mapping(uint256 => uint256) counts; // The sum of votes for each choice in the form `counts[choice]`.
        bool tied; // True if there is a tie, false otherwise.
        uint256 totalVoted; // A counter of votes made in the current round. Former uint[_appeal] votesInEachRound.
        uint256 totalCommitted; // A counter of commits made in the current round. Former commitsInRound.
        mapping(uint256 choiceId => uint256) paidFees; // Tracks the fees paid for each choice in this round.
        mapping(uint256 choiceId => bool) hasPaid; // True if this choice was fully funded, false otherwise.
        mapping(address account => mapping(uint256 choiceId => uint256)) contributions; // Maps contributors to their contributions for each choice.
        uint256 feeRewards; // Sum of reimbursable appeal fees available to the parties that made contributions to the ruling that ultimately wins a dispute.
        uint256[] fundedChoices; // Stores the choices that are fully funded.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct Vote {
        bool voted; // True if the vote has been cast.
        address account; // The address of the juror.
        bytes32 commit; // The commit of the juror. For courts with hidden votes.
        uint256 choice; // The choice of the juror.
        uint256[10] __gap; // Reserved slots for future upgrades.
    }

    struct Active {
        bool dispute; // True if at least one round in the dispute has been active on this Dispute Kit. False if the dispute is unknown to this Dispute Kit.
        bool currentRound; // True if the dispute's current round is active on this Dispute Kit. False if the dispute has jumped to another Dispute Kit.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant WINNER_STAKE_MULTIPLIER = 10000; // Multiplier of the appeal cost that the winner has to pay as fee stake for a round in basis points. Default is 1x of appeal fee.
    uint256 public constant LOSER_STAKE_MULTIPLIER = 20000; // Multiplier of the appeal cost that the loser has to pay as fee stake for a round in basis points. Default is 2x of appeal fee.
    uint256 public constant LOSER_APPEAL_PERIOD_MULTIPLIER = 5000; // Multiplier of the appeal period for the choice that wasn't voted for in the previous round, in basis points. Default is 1/2 of original appeal period.

    KlerosCore public core; // The Kleros Core arbitrator.
    Dispute[] public disputes; // Array of the locally created disputes.
    mapping(uint256 coreDisputeID => uint256 localDisputeID) public coreDisputeIDToLocal; // Maps the dispute ID in Kleros Core to the local dispute ID.
    mapping(uint256 coreDisputeID => Active) public coreDisputeIDToActive; // Active status of the dispute and the current round.
    address public wNative; // The wrapped native token for safeSend().
    uint256 jumpDisputeKitID; // ID of the dispute kit to switch on after jump.
    uint256 public maxExtraFilteringAttempts; // Maximum number of extra draw attempts before bypassing the drawing filter.

    uint256[50] private __gap; // Reserved slots for future upgrades.

    address public accreditedProfessionalToken; // The address of the accredited professional token.
    address public accreditedConsumerProtectionLawyerToken; // The address of the accredited consumer protection lawyer token.
    mapping(uint256 localDisputeID => mapping(uint256 localRoundID => bool)) public drawnConsumerProtectionLawyer; // Maps the local dispute and round ID to the boolean indicating if the consumer protection lawyer was drawn.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be emitted when a dispute is created.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _numberOfChoices The number of choices available in the dispute.
    event DisputeCreation(uint256 indexed _coreDisputeID, uint256 _numberOfChoices);

    /// @notice To be emitted when a vote commitment is cast.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _juror The address of the juror casting the vote commitment.
    /// @param _voteIDs The identifiers of the votes in the dispute.
    /// @param _commit The commitment of the juror.
    event CommitCast(uint256 indexed _coreDisputeID, address indexed _juror, uint256[] _voteIDs, bytes32 _commit);

    /// @notice To be emitted when a funding contribution is made.
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

    /// @notice To be emitted when the contributed funds are withdrawn.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _choice The choice that is being funded.
    /// @param _contributor The address of the contributor.
    /// @param _amount The amount withdrawn.
    event Withdrawal(uint256 indexed _coreDisputeID, uint256 _choice, address indexed _contributor, uint256 _amount);

    /// @notice To be emitted when a choice is fully funded for an appeal.
    /// @param _coreDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _coreRoundID The identifier of the round in the Arbitrator contract.
    /// @param _choice The choice that is being funded.
    event ChoiceFunded(uint256 indexed _coreDisputeID, uint256 indexed _coreRoundID, uint256 indexed _choice);

    // ************************************* //
    // *              Modifiers            * //
    // ************************************* //

    modifier onlyCore() {
        require(address(core) == msg.sender, KlerosCoreOnly());
        _;
    }

    modifier isActive(uint256 _coreDisputeID) {
        require(coreDisputeIDToActive[_coreDisputeID].dispute, DisputeUnknownInThisDisputeKit());
        require(coreDisputeIDToActive[_coreDisputeID].currentRound, DisputeJumpedToAnotherDisputeKit());
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializer.
    /// @param _core The KlerosCore arbitrator.
    /// @param _wNative The wrapped native token address, typically wETH.
    /// @param _jumpDisputeKitID ID of the dispute kit to jump on.
    /// @param _maxExtraFilteringAttempts Maximum number of extra draw attempts before bypassing the drawing filter.
    /// @param _accreditedProfessionalToken The address of the accredited professional token.
    /// @param _accreditedConsumerProtectionLawyerToken The address of the accredited consumer protection lawyer token.
    function initialize(
        KlerosCore _core,
        address _wNative,
        uint256 _jumpDisputeKitID,
        uint256 _maxExtraFilteringAttempts,
        address _accreditedProfessionalToken,
        address _accreditedConsumerProtectionLawyerToken
    ) external initializer {
        core = _core;
        wNative = _wNative;
        jumpDisputeKitID = _jumpDisputeKitID;
        maxExtraFilteringAttempts = _maxExtraFilteringAttempts;
        accreditedProfessionalToken = _accreditedProfessionalToken;
        accreditedConsumerProtectionLawyerToken = _accreditedConsumerProtectionLawyerToken;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Creates a local dispute and maps it to the dispute ID in the Core contract.
    /// @dev Access restricted to Kleros Core only.
    /// @dev The new `KlerosCore.Round` must be created before calling this function.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _numberOfChoices Number of choices of the dispute.
    function createDispute(uint256 _coreDisputeID, uint256 _coreRoundID, uint256 _numberOfChoices) public onlyCore {
        uint256 localDisputeID;
        Dispute storage dispute;
        Active storage active = coreDisputeIDToActive[_coreDisputeID];
        if (active.dispute) {
            // The dispute has already been created in this DK in a previous round. E.g. if DK1 jumps to DK2 and then back to DK1.
            localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
            dispute = disputes[localDisputeID];
        } else {
            // The dispute has not been created in this DK yet.
            localDisputeID = disputes.length;
            dispute = disputes.push();
            coreDisputeIDToLocal[_coreDisputeID] = localDisputeID;
            active.dispute = true;
        }

        active.currentRound = true;
        dispute.numberOfChoices = _numberOfChoices;

        // KlerosCore.Round must have been already created.
        dispute.coreRoundIDToLocal[_coreRoundID] = dispute.rounds.length;
        dispute.rounds.push().tied = true;

        emit DisputeCreation(_coreDisputeID, _numberOfChoices);
    }

    /// @notice Draws the juror from the sortition tree. The drawn address is picked up by Kleros Core.
    /// @dev Access restricted to Kleros Core only.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _nonce Nonce that represents the current drawing iteration in this round.
    /// @param _roundNbVotes The number of votes in the round, including already drawn and yet to be drawn.
    /// @return drawnAddress The drawn address.
    /// @return fromSubcourtID The subcourt ID from which the juror was drawn.
    function draw(
        uint256 _coreDisputeID,
        uint256 _nonce,
        uint256 _roundNbVotes
    ) public onlyCore isActive(_coreDisputeID) returns (address drawnAddress, uint96 fromSubcourtID) {
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

        // Apply the DK-specific drawing filter only up to the attempt limit.
        // After that, bypass the filter so drawing can always finish, otherwise a dispute can get stuck indefinitely.
        bool applyFilter = _nonce < _roundNbVotes + maxExtraFilteringAttempts;

        if (IBalanceHolder(accreditedConsumerProtectionLawyerToken).balanceOf(drawnAddress) > 0) {
            // The drawnAddress is a consumer protection lawyer.
            drawnConsumerProtectionLawyer[localDisputeID][localRoundID] = true;
        } else if (applyFilter) {
            // If it's the last draw iteration and we still have not drawn a consumer protection lawyer
            // reject this draw so that another iteration can try again later.
            // If it's not the last draw accept any juror with accredited professional token.
            bool lawyerStillNotDrawn = round.votes.length == _roundNbVotes - 1 &&
                !drawnConsumerProtectionLawyer[localDisputeID][localRoundID];

            if (lawyerStillNotDrawn || IBalanceHolder(accreditedProfessionalToken).balanceOf(drawnAddress) == 0) {
                drawnAddress = address(0);
                return (drawnAddress, fromSubcourtID);
            }
        }

        Vote storage vote = round.votes.push();
        vote.account = drawnAddress;

        return (drawnAddress, fromSubcourtID);
    }

    /// @notice Sets the caller's commit for the specified votes.
    ///
    /// @dev It can be called multiple times during the commit period, each call overrides the commits of the previous one.
    /// `O(n)` where `n` is the number of votes.
    ///
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _voteIDs The IDs of the votes.
    /// @param _commit The commitment hash.
    function castCommit(
        uint256 _coreDisputeID,
        uint256[] calldata _voteIDs,
        bytes32 _commit
    ) external isActive(_coreDisputeID) {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period == KlerosCore.Period.commit, NotCommitPeriod());
        require(_voteIDs.length > 0, EmptyVoteIDs());
        require(_commit != bytes32(0), EmptyCommit());

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        // Introduce a counter so we don't count a re-committed votes.
        uint256 commitCount;
        for (uint256 i = 0; i < _voteIDs.length; i++) {
            require(round.votes[_voteIDs[i]].account == msg.sender, JurorHasToOwnTheVote());
            if (round.votes[_voteIDs[i]].commit == bytes32(0)) {
                commitCount++;
            }
            round.votes[_voteIDs[i]].commit = _commit;
        }
        round.totalCommitted += commitCount;
        emit CommitCast(_coreDisputeID, msg.sender, _voteIDs, _commit);
    }

    /// @notice Sets the caller's choices for the specified votes.
    ///
    /// @dev `O(n)` where `n` is the number of votes.
    ///
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
    ) external isActive(_coreDisputeID) {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period == KlerosCore.Period.vote, NotVotePeriod());
        require(_voteIDs.length > 0, EmptyVoteIDs());

        uint256 localDisputeID = coreDisputeIDToLocal[_coreDisputeID];
        Dispute storage dispute = disputes[localDisputeID];
        require(_choice <= dispute.numberOfChoices, ChoiceOutOfBounds());

        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        uint256 courtParamsIndex = core.getCourtParametersIndex(
            _coreDisputeID,
            core.getNumberOfRounds(_coreDisputeID) - 1
        );
        bool hiddenVotes = core.getAdditionalCourtParams(courtID, courtParamsIndex).hiddenVotes;

        uint256 localRoundID = dispute.rounds.length - 1;
        Round storage round = dispute.rounds[localRoundID];

        bytes32 actualVoteHash = keccak256(abi.encodePacked(_choice, msg.sender, _salt));

        for (uint256 i = 0; i < _voteIDs.length; i++) {
            Vote storage vote = round.votes[_voteIDs[i]];

            // Verify commitments.
            if (hiddenVotes) {
                require(vote.commit == actualVoteHash, ChoiceCommitmentMismatch());
            }

            // Save the votes.
            require(vote.account == msg.sender, JurorHasToOwnTheVote());
            require(!vote.voted, VoteAlreadyCast());
            vote.choice = _choice;
            vote.voted = true;
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
        emit VoteCast(_coreDisputeID, msg.sender, _voteIDs, _choice, _justification);
    }

    /// @notice Manages contributions, and appeals a dispute if at least two choices are fully funded.
    /// Note that the surplus deposit will be reimbursed.
    /// @param _coreDisputeID Index of the dispute in Kleros Core.
    /// @param _choice A choice that receives funding.
    function fundAppeal(uint256 _coreDisputeID, uint256 _choice) external payable isActive(_coreDisputeID) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        require(_choice <= dispute.numberOfChoices, ChoiceOutOfBounds());

        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = core.appealPeriod(_coreDisputeID);
        require(block.timestamp >= appealPeriodStart && block.timestamp < appealPeriodEnd, NotAppealPeriod());

        uint256 multiplier;
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        // In case of a tie give all rulings the winner treatment.
        // Note that since all parties have the full appeal period to fund, one party may fund at the last second and become the only fully funded choice.
        // This is intentional: in case of a tie parties are expected to fund the rulings they want to preserve.
        if (round.tied || round.winningChoice == _choice) {
            multiplier = WINNER_STAKE_MULTIPLIER;
        } else {
            require(
                block.timestamp - appealPeriodStart <
                    ((appealPeriodEnd - appealPeriodStart) * LOSER_APPEAL_PERIOD_MULTIPLIER) / ONE_BASIS_POINT,
                NotAppealPeriodForLoser()
            );
            multiplier = LOSER_STAKE_MULTIPLIER;
        }

        uint256 coreRoundID = core.getNumberOfRounds(_coreDisputeID) - 1;

        require(!round.hasPaid[_choice], AppealFeeIsAlreadyPaid());
        uint256 appealCost = core.appealCost(_coreDisputeID);
        uint256 totalCost = appealCost + (appealCost * multiplier) / ONE_BASIS_POINT;

        // Take up to the amount necessary to fund the current round at the current costs.
        uint256 contribution;
        if (totalCost > round.paidFees[_choice]) {
            contribution = totalCost - round.paidFees[_choice] > msg.value
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

            uint256 currentDisputeKitID = core.getDisputeKitID(_coreDisputeID, coreRoundID);
            (, uint256 newDisputeKitID, ) = getNextRoundSettings(_coreDisputeID);
            if (currentDisputeKitID != newDisputeKitID) {
                // Don't create a new round in case of a jump, and remove local dispute from the flow.
                coreDisputeIDToActive[_coreDisputeID].currentRound = false;
            } else {
                // Don't subtract 1 from length since both round arrays haven't been updated yet.
                dispute.coreRoundIDToLocal[coreRoundID + 1] = dispute.rounds.length;
                Round storage newRound = dispute.rounds.push();
                newRound.tied = true;
            }
            core.appeal{value: appealCost}(_coreDisputeID, dispute.numberOfChoices);
        }

        if (msg.value > contribution) payable(msg.sender).safeSend(msg.value - contribution, wNative);
    }

    /// @notice Allows those contributors who attempted to fund an appeal round to withdraw any reimbursable fees or rewards after the dispute gets resolved.
    /// @dev It can be called after the dispute has jumped to another dispute kit.
    /// @dev `O(r)` where `r` is the number of rounds of the dispute in this DisputeKit.
    /// The number of rounds is bounded by the appeal mechanism: the number of jurors increases on each appeal,
    /// eventually triggering court jumps up the hierarchy and ultimately reaching the Final Court.
    /// @param _coreDisputeID Index of the dispute in Kleros Core contract.
    /// @param _beneficiary The address whose rewards to withdraw.
    /// @param _choice The ruling option that the caller wants to withdraw from.
    /// @return amount The withdrawn amount.
    function withdrawFeesAndRewards(
        uint256 _coreDisputeID,
        address payable _beneficiary,
        uint256 _choice
    ) external returns (uint256 amount) {
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        require(period == KlerosCore.Period.execution, DisputeNotResolved());
        require(coreDisputeIDToActive[_coreDisputeID].dispute, DisputeUnknownInThisDisputeKit());

        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        (uint256 finalRuling, , ) = core.currentRuling(_coreDisputeID);

        for (uint256 i = 0; i < dispute.rounds.length; i++) {
            Round storage round = dispute.rounds[i];

            if (!round.hasPaid[_choice]) {
                // Allow to reimburse if funding was unsuccessful for this ruling option.
                amount += round.contributions[_beneficiary][_choice];
            } else {
                // Funding was successful for this ruling option.
                if (_choice == finalRuling) {
                    // This ruling option is the ultimate winner.
                    amount += round.paidFees[_choice] > 0
                        ? (round.contributions[_beneficiary][_choice] * round.feeRewards) / round.paidFees[_choice]
                        : 0;
                } else if (!round.hasPaid[finalRuling]) {
                    // The ultimate winner was not funded in this round. In this case funded ruling option(s) are reimbursed.
                    amount +=
                        (round.contributions[_beneficiary][_choice] * round.feeRewards) /
                        (round.paidFees[round.fundedChoices[0]] + round.paidFees[round.fundedChoices[1]]);
                }
            }
            round.contributions[_beneficiary][_choice] = 0;
        }

        if (amount != 0) {
            _beneficiary.safeSend(amount, wNative);
            emit Withdrawal(_coreDisputeID, _choice, _beneficiary, amount);
        }
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Checks if the juror is eligible to stake or to vote in the court.
    /// @param _juror The address of the juror.
    /// @param - courtID The ID of the court. Unused, required by interface.
    /// @return True if the juror is eligible, false otherwise.
    function isEligible(address _juror, uint96 /* _courtID */) external view returns (bool) {
        return
            IBalanceHolder(accreditedConsumerProtectionLawyerToken).balanceOf(_juror) > 0 ||
            IBalanceHolder(accreditedProfessionalToken).balanceOf(_juror) > 0;
    }

    /// @notice Returns the rulings that were fully funded in the latest appeal round.
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return fundedChoices Fully funded rulings.
    function getFundedChoices(uint256 _coreDisputeID) public view returns (uint256[] memory fundedChoices) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage lastRound = dispute.rounds[dispute.rounds.length - 1];
        return lastRound.fundedChoices;
    }

    /// @notice Gets the current ruling of a specified dispute.
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return ruling The current ruling.
    /// @return tied Whether it's a tie or not.
    /// @return overridden Whether the ruling was overridden by appeal funding or not.
    function currentRuling(uint256 _coreDisputeID) public view returns (uint256 ruling, bool tied, bool overridden) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        tied = round.tied;
        ruling = tied ? 0 : round.winningChoice;
        (, , KlerosCore.Period period, , ) = core.disputes(_coreDisputeID);
        // Override the final ruling if only one side funded the appeals.
        if (period == KlerosCore.Period.execution) {
            uint256[] memory fundedChoices = getFundedChoices(_coreDisputeID);
            if (fundedChoices.length == 1) {
                ruling = fundedChoices[0];
                tied = false;
                overridden = true;
            }
        }
    }

    /// @notice Gets the rewards for PNK and fees.
    /// @notice Intended to be called by KlerosCore. External callers must validate inputs beforehand.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @param _feeRewardPool Total amount of fees available for rewards to all coherent jurors.
    /// @param _pnkRewardPool Total amount of PNK available for rewards to all coherent jurors.
    /// @return feeReward The fee reward the juror is eligible to.
    /// @return pnkReward The pnk reward the juror is eligible to.
    function getRewards(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _feeRewardPool,
        uint256 _pnkRewardPool
    ) external view returns (uint256 feeReward, uint256 pnkReward) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage currentRound = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]];
        Vote storage vote = currentRound.votes[_voteID];

        (uint256 winningChoice, bool tied, ) = core.currentRuling(_coreDisputeID);

        uint256 coherentCount = tied ? currentRound.totalVoted : currentRound.counts[winningChoice];
        uint256 coherence;
        if (vote.voted && (vote.choice == winningChoice || tied)) {
            coherence = ONE_BASIS_POINT;
        } else if (coherentCount == 0) {
            return (0, 0);
        }

        uint256 availableFeeAmount = _feeRewardPool / coherentCount;
        feeReward = (availableFeeAmount * coherence) / ONE_BASIS_POINT;

        uint256 availablePnkAmount = _pnkRewardPool / coherentCount;
        pnkReward = (availablePnkAmount * coherence) / ONE_BASIS_POINT;
    }

    /// @notice Gets the pnk penalty for incoherent juror.
    /// @notice Intended to be called by KlerosCore. External callers must validate inputs beforehand.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the vote.
    /// @param _pnkAtStake Pnk amount subjected to penalty.
    /// @return penalty Juror's penalty.
    function getPenalty(
        uint256 _coreDisputeID,
        uint256 _coreRoundID,
        uint256 _voteID,
        uint256 _pnkAtStake
    ) external view returns (uint256 penalty) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];

        (uint256 winningChoice, bool tied, ) = core.currentRuling(_coreDisputeID);

        uint256 coherence;
        if (vote.voted && (vote.choice == winningChoice || tied)) {
            coherence = ONE_BASIS_POINT;
        }

        penalty = (_pnkAtStake * (ONE_BASIS_POINT - coherence)) / ONE_BASIS_POINT;
    }

    /// @notice Returns true if all of the jurors have cast their commits for the last round.
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether all of the jurors have cast their commits for the last round.
    function areCommitsAllCast(uint256 _coreDisputeID) external view returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        return round.totalCommitted == round.votes.length;
    }

    /// @notice Returns true if all of the jurors have cast their votes for the last round.
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether all of the jurors have cast their votes for the last round.
    function areVotesAllCast(uint256 _coreDisputeID) external view returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];

        (uint96 courtID, , , , ) = core.disputes(_coreDisputeID);
        uint256 courtParamsIndex = core.getCourtParametersIndex(
            _coreDisputeID,
            core.getNumberOfRounds(_coreDisputeID) - 1
        );
        bool hiddenVotes = core.getAdditionalCourtParams(courtID, courtParamsIndex).hiddenVotes;
        uint256 expectedTotalVoted = hiddenVotes ? round.totalCommitted : round.votes.length;

        return round.totalVoted == expectedTotalVoted;
    }

    /// @notice Returns true if the appeal time is finished prematurely (e.g. when losing side didn't fund).
    /// @notice Does not validate that coreDisputeID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID 0.
    /// @dev This function is to be called directly by the core contract and is not for off-chain usage.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return Whether the appeal time is finished.
    function isAppealTimeFinished(uint256 _coreDisputeID) external view returns (bool) {
        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = core.appealPeriod(_coreDisputeID);
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Round storage round = dispute.rounds[dispute.rounds.length - 1];
        // In case of a tie all rulings have the full appeal period.
        if (round.tied) return false;

        uint256[] memory fundedChoices = getFundedChoices(_coreDisputeID);
        bool loserNotFunded = fundedChoices.length == 0 ||
            (fundedChoices.length == 1 && fundedChoices[0] == round.winningChoice);
        // Loser didn't fund in the first half, so appeal period can be ended prematurely.
        return (loserNotFunded &&
            block.timestamp - appealPeriodStart >=
            ((appealPeriodEnd - appealPeriodStart) * LOSER_APPEAL_PERIOD_MULTIPLIER) / ONE_BASIS_POINT);
    }

    /// @notice Returns the next round settings for a given dispute.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @return newCourtID Court ID after jump.
    /// @return newDisputeKitID Dispute kit ID after jump.
    /// @return newRoundNbVotes The number of votes in the new round.
    function getNextRoundSettings(
        uint256 _coreDisputeID
    ) public view returns (uint96 newCourtID, uint256 newDisputeKitID, uint256 newRoundNbVotes) {
        (uint96 currentCourtID, , , , ) = core.disputes(_coreDisputeID);
        (uint96 parentCourtID, , , , ) = core.courts(currentCourtID);

        uint256 coreRoundID = core.getNumberOfRounds(_coreDisputeID) - 1;

        uint256 courtParamsIndex = core.getCourtParametersIndex(_coreDisputeID, coreRoundID);
        uint256 currentCourtJurorsForJump = core
            .getAdditionalCourtParams(currentCourtID, courtParamsIndex)
            .jurorsForCourtJump;

        uint256 currentDisputeKitID = core.getDisputeKitID(_coreDisputeID, coreRoundID);
        uint256 currentRoundNbVotes = core.getNumberOfVotes(_coreDisputeID, coreRoundID);

        newCourtID = currentRoundNbVotes >= currentCourtJurorsForJump ? parentCourtID : currentCourtID;
        newDisputeKitID = !core.isSupported(newCourtID, currentDisputeKitID) ? jumpDisputeKitID : currentDisputeKitID;
        newRoundNbVotes = (currentRoundNbVotes * 2) + 1;
    }

    /// @notice Returns true if the specified voter was active in this round.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _voteID The ID of the voter.
    /// @return Whether the voter was active or not.
    function isVoteActive(uint256 _coreDisputeID, uint256 _coreRoundID, uint256 _voteID) external view returns (bool) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        return vote.voted;
    }

    /// @notice Returns the info of the specified round in the Dispute kit.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
    /// @param _coreDisputeID The ID of the dispute in Kleros Core.
    /// @param _coreRoundID The ID of the round in Kleros Core.
    /// @param _choice The choice to query.
    /// @return winningChoice The winning choice of this round.
    /// @return tied Whether it's a tie or not.
    /// @return totalVoted Number of jurors who cast the vote already.
    /// @return totalCommitted Number of jurors who cast the commit already (only relevant for hidden votes).
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
            uint256 totalCommitted,
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

    /// @notice Returns the number of rounds created in this dispute kit for the dispute.
    /// @param _localDisputeID The ID of the dispute in the Dispute Kit.
    /// @return The number of rounds in the dispute.
    function getNumberOfRounds(uint256 _localDisputeID) external view returns (uint256) {
        return disputes[_localDisputeID].rounds.length;
    }

    /// @notice Returns the local dispute ID and round ID for a given core dispute ID and core round ID. Will return 0 if coreDisputeID/coreRoundID is not known in this dispute kit.
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

    /// @notice Returns the vote information for a given vote ID.
    /// @notice Does not validate that coreDisputeID/coreRoundID is known in this dispute kit. Passing unknown IDs may return data for localDisputeID/localRoundID 0.
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
    ) external view returns (address account, bytes32 commit, uint256 choice, bool voted) {
        Dispute storage dispute = disputes[coreDisputeIDToLocal[_coreDisputeID]];
        Vote storage vote = dispute.rounds[dispute.coreRoundIDToLocal[_coreRoundID]].votes[_voteID];
        return (vote.account, vote.commit, vote.choice, vote.voted);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error KlerosCoreOnly();
    error DisputeJumpedToAnotherDisputeKit();
    error DisputeUnknownInThisDisputeKit();
    error NotCommitPeriod();
    error EmptyCommit();
    error JurorHasToOwnTheVote();
    error NotVotePeriod();
    error EmptyVoteIDs();
    error ChoiceOutOfBounds();
    error ChoiceCommitmentMismatch();
    error VoteAlreadyCast();
    error NotAppealPeriod();
    error NotAppealPeriodForLoser();
    error AppealFeeIsAlreadyPaid();
    error DisputeNotResolved();
}
