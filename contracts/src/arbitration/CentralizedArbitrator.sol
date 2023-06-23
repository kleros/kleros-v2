// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {IArbitrableV2, IArbitratorV2, IERC20} from "./interfaces/IArbitratorV2.sol";

/// @title Centralized Arbitrator
/// @dev This is a centralized arbitrator deciding alone on the result of disputes. It illustrates how IArbitratorV2 interface can be implemented.
/// Note that this contract supports appeals. The ruling given by the arbitrator can be appealed by crowdfunding a desired choice.
contract CentralizedArbitrator is IArbitratorV2 {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    enum DisputeStatus {
        Waiting, // The dispute is waiting for the ruling or not created.
        Appealable, // The dispute can be appealed.
        Solved // The dispute is resolved.
    }

    struct DisputeStruct {
        IArbitrableV2 arbitrated; // The address of the arbitrable contract.
        bytes arbitratorExtraData; // Extra data for the arbitrator.
        uint256 choices; // The number of choices the arbitrator can choose from.
        uint256 appealPeriodStart; // Time when the appeal funding becomes possible.
        uint256 arbitrationFee; // Fee paid by the arbitrable for the arbitration. Must be equal or higher than arbitration cost.
        uint256 ruling; // Ruling given by the arbitrator.
        DisputeStatus status; // A current status of the dispute.
    }

    struct Round {
        mapping(uint256 => uint256) paidFees; // Tracks the fees paid for each choice in this round.
        mapping(uint256 => bool) hasPaid; // True if this choice was fully funded, false otherwise.
        mapping(address => mapping(uint256 => uint256)) contributions; // Maps contributors to their contributions for each choice.
        uint256 feeRewards; // Sum of reimbursable appeal fees available to the parties that made contributions to the ruling that ultimately wins a dispute.
        uint256[] fundedChoices; // Stores the choices that are fully funded.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    // The required fee stake that a party must pay depends on who won the previous round and is proportional to the appeal cost such that the fee stake for a round is stake multiplier * appeal cost for that round.
    uint256 public constant WINNER_STAKE_MULTIPLIER = 10000; // Multiplier of the appeal cost that the winner has to pay as fee stake for a round in basis points. Default is 1x of appeal fee.
    uint256 public constant LOSER_STAKE_MULTIPLIER = 20000; // Multiplier of the appeal cost that the loser has to pay as fee stake for a round in basis points. Default is 2x of appeal fee.
    uint256 public constant LOSER_APPEAL_PERIOD_MULTIPLIER = 5000; // Multiplier of the appeal period for the choice that wasn't voted for in the previous round, in basis points. Default is 1/2 of original appeal period.
    uint256 public constant MULTIPLIER_DIVISOR = 10000;
    address public owner = msg.sender; // Owner of the contract.
    uint256 public appealDuration; // The duration of the appeal period.

    uint256 private arbitrationFee; // The cost to create a dispute. Made private because of the arbitrationCost() getter.
    uint256 public appealFee; // The cost to fund one of the choices, not counting the additional fee stake amount.

    DisputeStruct[] public disputes; // Stores the dispute info. disputes[disputeID].
    mapping(uint256 => Round[]) public disputeIDtoRoundArray; // Maps dispute IDs to Round array that contains the info about crowdfunding.

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @dev To be emitted when a dispute can be appealed.
    /// @param _disputeID ID of the dispute.
    /// @param _arbitrable The contract which created the dispute.
    event AppealPossible(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);

    /// @dev To be emitted when the current ruling is appealed.
    /// @param _disputeID ID of the dispute.
    /// @param _arbitrable The contract which created the dispute.
    event AppealDecision(uint256 indexed _disputeID, IArbitrableV2 indexed _arbitrable);

    /// @dev Raised when a contribution is made, inside fundAppeal function.
    /// @param _disputeID ID of the dispute.
    /// @param _round The round the contribution was made to.
    /// @param _choice Indicates the choice option which got the contribution.
    /// @param _contributor Caller of fundAppeal function.
    /// @param _amount Contribution amount.
    event Contribution(
        uint256 indexed _disputeID,
        uint256 indexed _round,
        uint256 _choice,
        address indexed _contributor,
        uint256 _amount
    );

    /// @dev Raised when a contributor withdraws a non-zero value.
    /// @param _disputeID ID of the dispute.
    /// @param _round The round the withdrawal was made from.
    /// @param _choice Indicates the choice which contributor gets rewards from.
    /// @param _contributor The beneficiary of the withdrawal.
    /// @param _amount Total withdrawn amount, consists of reimbursed deposits and rewards.
    event Withdrawal(
        uint256 indexed _disputeID,
        uint256 indexed _round,
        uint256 _choice,
        address indexed _contributor,
        uint256 _amount
    );

    /// @dev To be raised when a choice is fully funded for appeal.
    /// @param _disputeID ID of the dispute.
    /// @param _round ID of the round where the choice was funded.
    /// @param _choice The choice that just got fully funded.
    event ChoiceFunded(uint256 indexed _disputeID, uint256 indexed _round, uint256 indexed _choice);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyOwner() {
        require(msg.sender == owner, "Can only be called by the owner.");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor.
    /// @param _arbitrationFee Amount to be paid for arbitration.
    /// @param _appealDuration Duration of the appeal period.
    /// @param _appealFee Amount to be paid to fund one of the appeal choices, not counting the additional fee stake amount.
    constructor(uint256 _arbitrationFee, uint256 _appealDuration, uint256 _appealFee) {
        arbitrationFee = _arbitrationFee;
        appealDuration = _appealDuration;
        appealFee = _appealFee;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @dev Set the arbitration fee. Only callable by the owner.
    /// @param _arbitrationFee Amount to be paid for arbitration.
    function setArbitrationFee(uint256 _arbitrationFee) external onlyOwner {
        arbitrationFee = _arbitrationFee;
    }

    /// @dev Set the duration of the appeal period. Only callable by the owner.
    /// @param _appealDuration New duration of the appeal period.
    function setAppealDuration(uint256 _appealDuration) external onlyOwner {
        appealDuration = _appealDuration;
    }

    /// @dev Set the appeal fee. Only callable by the owner.
    /// @param _appealFee Amount to be paid for appeal.
    function setAppealFee(uint256 _appealFee) external onlyOwner {
        appealFee = _appealFee;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @inheritdoc IArbitratorV2
    function createDispute(
        uint256 _choices,
        bytes calldata _extraData
    ) external payable override returns (uint256 disputeID) {
        require(msg.value >= arbitrationCost(_extraData), "Arbitration fees: not enough.");
        disputeID = disputes.length;
        disputes.push(
            DisputeStruct({
                arbitrated: IArbitrableV2(msg.sender),
                arbitratorExtraData: _extraData,
                choices: _choices,
                appealPeriodStart: 0,
                arbitrationFee: msg.value,
                ruling: 0,
                status: DisputeStatus.Waiting
            })
        );

        disputeIDtoRoundArray[disputeID].push();
        emit DisputeCreation(disputeID, IArbitrableV2(msg.sender));
    }

    /// @inheritdoc IArbitratorV2
    function createDispute(
        uint256 /*_choices*/,
        bytes calldata /*_extraData*/,
        IERC20 /*_feeToken*/,
        uint256 /*_feeAmount*/
    ) external pure override returns (uint256) {
        revert("Not supported");
    }

    /// @dev Manages contributions, and appeals a dispute if at least two choices are fully funded. This function allows the appeals to be crowdfunded.
    /// Note that the surplus deposit will be reimbursed.
    /// @param _disputeID Index of the dispute to appeal.
    /// @param _choice A choice that receives funding.
    function fundAppeal(uint256 _disputeID, uint256 _choice) external payable {
        DisputeStruct storage dispute = disputes[_disputeID];
        require(dispute.status == DisputeStatus.Appealable, "Dispute not appealable.");
        require(_choice <= dispute.choices, "There is no such ruling to fund.");

        (uint256 appealPeriodStart, uint256 appealPeriodEnd) = appealPeriod(_disputeID);
        require(block.timestamp >= appealPeriodStart && block.timestamp < appealPeriodEnd, "Appeal period is over.");

        uint256 multiplier;
        if (dispute.ruling == _choice) {
            multiplier = WINNER_STAKE_MULTIPLIER;
        } else {
            require(
                block.timestamp - appealPeriodStart <
                    ((appealPeriodEnd - appealPeriodStart) * LOSER_APPEAL_PERIOD_MULTIPLIER) / MULTIPLIER_DIVISOR,
                "Appeal period is over for loser"
            );
            multiplier = LOSER_STAKE_MULTIPLIER;
        }

        Round[] storage rounds = disputeIDtoRoundArray[_disputeID];
        uint256 lastRoundIndex = rounds.length - 1;
        Round storage lastRound = rounds[lastRoundIndex];
        require(!lastRound.hasPaid[_choice], "Appeal fee is already paid.");

        uint256 totalCost = appealFee + (appealFee * multiplier) / MULTIPLIER_DIVISOR;

        // Take up to the amount necessary to fund the current round at the current costs.
        uint256 contribution;
        if (totalCost > lastRound.paidFees[_choice]) {
            contribution = totalCost - lastRound.paidFees[_choice] > msg.value // Overflows and underflows will be managed on the compiler level.
                ? msg.value
                : totalCost - lastRound.paidFees[_choice];
            emit Contribution(_disputeID, lastRoundIndex, _choice, msg.sender, contribution);
        }

        lastRound.contributions[msg.sender][_choice] += contribution;
        lastRound.paidFees[_choice] += contribution;
        if (lastRound.paidFees[_choice] >= totalCost) {
            lastRound.feeRewards += lastRound.paidFees[_choice];
            lastRound.fundedChoices.push(_choice);
            lastRound.hasPaid[_choice] = true;
            emit ChoiceFunded(_disputeID, lastRoundIndex, _choice);
        }

        if (lastRound.fundedChoices.length > 1) {
            // At least two sides are fully funded.
            rounds.push();
            lastRound.feeRewards = lastRound.feeRewards - appealFee;

            dispute.status = DisputeStatus.Waiting;
            dispute.appealPeriodStart = 0;
            emit AppealDecision(_disputeID, dispute.arbitrated);
        }

        if (msg.value > contribution) payable(msg.sender).send(msg.value - contribution);
    }

    /// @dev Give a ruling to a dispute. Once it's given the dispute can be appealed, and after the appeal period has passed this function should be called again to finalize the ruling.
    /// Accounts for the situation where the winner loses a case due to paying less appeal fees than expected.
    /// @param _disputeID ID of the dispute to rule.
    /// @param _ruling Ruling given by the arbitrator. Note that 0 means that arbitrator chose "Refused to rule".
    function giveRuling(uint256 _disputeID, uint256 _ruling) external onlyOwner {
        DisputeStruct storage dispute = disputes[_disputeID];
        require(_ruling <= dispute.choices, "Invalid ruling.");
        require(dispute.status != DisputeStatus.Solved, "The dispute must not be solved.");

        if (dispute.status == DisputeStatus.Waiting) {
            dispute.ruling = _ruling;
            dispute.status = DisputeStatus.Appealable;
            dispute.appealPeriodStart = block.timestamp;
            emit AppealPossible(_disputeID, dispute.arbitrated);
        } else {
            require(block.timestamp > dispute.appealPeriodStart + appealDuration, "Appeal period not passed yet.");
            dispute.ruling = _ruling;
            dispute.status = DisputeStatus.Solved;

            Round[] storage rounds = disputeIDtoRoundArray[_disputeID];
            Round storage lastRound = rounds[rounds.length - 1];
            // If only one ruling option is funded, it wins by default. Note that if any other ruling had funded, an appeal would have been created.
            if (lastRound.fundedChoices.length == 1) {
                dispute.ruling = lastRound.fundedChoices[0];
            }

            payable(msg.sender).send(dispute.arbitrationFee); // Avoid blocking.
            dispute.arbitrated.rule(_disputeID, dispute.ruling);
        }
    }

    /// @dev Allows to withdraw any reimbursable fees or rewards after the dispute gets resolved.
    /// @param _disputeID Index of the dispute in disputes array.
    /// @param _beneficiary The address which rewards to withdraw.
    /// @param _round The round the caller wants to withdraw from.
    /// @param _choice The ruling option that the caller wants to withdraw from.
    /// @return amount The withdrawn amount.
    function withdrawFeesAndRewards(
        uint256 _disputeID,
        address payable _beneficiary,
        uint256 _round,
        uint256 _choice
    ) external returns (uint256 amount) {
        DisputeStruct storage dispute = disputes[_disputeID];
        require(dispute.status == DisputeStatus.Solved, "Dispute should be resolved.");
        Round storage round = disputeIDtoRoundArray[_disputeID][_round];

        if (!round.hasPaid[_choice]) {
            // Allow to reimburse if funding was unsuccessful for this ruling option.
            amount = round.contributions[_beneficiary][_choice];
        } else {
            // Funding was successful for this ruling option.
            if (_choice == dispute.ruling) {
                // This ruling option is the ultimate winner.
                amount = round.paidFees[_choice] > 0
                    ? (round.contributions[_beneficiary][_choice] * round.feeRewards) / round.paidFees[_choice]
                    : 0;
            } else if (!round.hasPaid[dispute.ruling]) {
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

    /// @inheritdoc IArbitratorV2
    function arbitrationCost(bytes calldata /*_extraData*/) public view override returns (uint256 fee) {
        return arbitrationFee;
    }

    /// @inheritdoc IArbitratorV2
    function arbitrationCost(
        bytes calldata /*_extraData*/,
        IERC20 /*_feeToken*/
    ) public pure override returns (uint256 /*cost*/) {
        revert("Not supported");
    }

    /// @dev Return the funded amount and funding goal for one of the choices.
    /// @param _disputeID The ID of the dispute to appeal.
    /// @param _choice The choice to check the funding status of.
    /// @return funded The amount funded so far for this choice in wei.
    /// @return goal The amount to fully fund this choice in wei.
    function fundingStatus(uint256 _disputeID, uint256 _choice) external view returns (uint256 funded, uint256 goal) {
        DisputeStruct storage dispute = disputes[_disputeID];
        require(_choice <= dispute.choices, "There is no such ruling to fund.");
        require(dispute.status == DisputeStatus.Appealable, "Dispute not appealable.");

        if (dispute.ruling == _choice) {
            goal = appealFee + (appealFee * WINNER_STAKE_MULTIPLIER) / MULTIPLIER_DIVISOR;
        } else {
            goal = appealFee + (appealFee * LOSER_STAKE_MULTIPLIER) / MULTIPLIER_DIVISOR;
        }

        Round[] storage rounds = disputeIDtoRoundArray[_disputeID];
        Round storage lastRound = rounds[rounds.length - 1];

        return (lastRound.paidFees[_choice], goal);
    }

    /// @dev Compute the start and end of the dispute's appeal period, if possible. If the dispute is not appealble return (0, 0).
    /// @param _disputeID ID of the dispute.
    /// @return start The start of the period.
    /// @return end The end of the period.
    function appealPeriod(uint256 _disputeID) public view returns (uint256 start, uint256 end) {
        DisputeStruct storage dispute = disputes[_disputeID];
        if (dispute.status == DisputeStatus.Appealable) {
            start = dispute.appealPeriodStart;
            end = start + appealDuration;
        }
        return (start, end);
    }

    function currentRuling(
        uint256 /*_disputeID*/
    ) public pure returns (uint256 /*ruling*/, bool /*tied*/, bool /*overridden*/) {
        revert("Not supported");
    }
}
