// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IArbitrableV2} from "../interfaces/IArbitrableV2.sol";
import {IArbitratorV2} from "../interfaces/IArbitratorV2.sol";
import {IDisputeTemplateRegistry} from "../interfaces/IDisputeTemplateRegistry.sol";

/// @title Implementation of the Evidence Standard with Moderated Submissions
contract ModeratedEvidenceModule is IArbitrableV2 {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    enum Party {
        None,
        Submitter,
        Moderator
    }

    struct EvidenceData {
        address payable submitter; // Address that submitted the evidence.
        bool disputed; // Whether the evidence submission has been disputed.
        Party ruling; // Final status of the evidence. If not disputed, can be changed by opening another round of moderation.
        uint256 disputeID; // The ID of the dispute. An evidence submission can only be disputed once.
        Moderation[] moderations; // Stores the data of each moderation event. An evidence submission can be moderated many times.
    }

    struct Moderation {
        uint256[3] paidFees; // Tracks the fees paid by each side in this moderation.
        uint256 feeRewards; // Sum of reimbursable fees and stake rewards available to the parties that made contributions to the side that ultimately wins a dispute.
        mapping(address contributor => uint256[3]) contributions; // Maps contributors to their contributions for each side.
        bool closed; // Moderation happens over a bounded period of time after which it is considered closed. If so, a new moderation round should be opened.
        Party currentWinner; // The current winner of this moderation round.
        uint256 bondDeadline; // The deadline until which the loser party can stake to overturn the current status.
        uint256 arbitratorDataID; // The index of the relevant arbitratorData struct.
    }

    struct ArbitratorData {
        uint256 disputeTemplateId; // The ID of the dispute template used by the arbitrator.
        bytes arbitratorExtraData; // Extra data for the arbitrator.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public constant AMOUNT_OF_CHOICES = 2;
    uint256 public constant MULTIPLIER_DIVISOR = 10000; // Divisor parameter for multipliers.
    mapping(bytes32 evidenceId => EvidenceData) evidences; // Maps the evidence ID to its data. evidences[evidenceID].
    mapping(uint256 => bytes32) public disputeIDtoEvidenceID; // One-to-one relationship between the dispute and the evidence.
    ArbitratorData[] public arbitratorDataList; // Stores the arbitrator data of the contract. Updated each time the data is changed.
    IArbitratorV2 public immutable arbitrator; // The trusted arbitrator to resolve potential disputes. If it needs to be changed, a new contract can be deployed.
    address public owner; // The address that can make governance changes to the parameters of the contract.
    IDisputeTemplateRegistry public templateRegistry; // The dispute template registry.
    uint256 public bondTimeout; // The time in seconds during which the last moderation status can be challenged.
    uint256 public totalCostMultiplier; // Multiplier of arbitration fees that must be ultimately paid as fee stake. In basis points.
    uint256 public initialDepositMultiplier; // Multiplier of arbitration fees that must be paid as initial stake for submitting evidence. In basis points.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyOwner() {
        require(msg.sender == owner, "The caller must be the owner");
        _;
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /// @notice To be raised when a moderated evidence is submitted. Should point to the resource (evidences are not to be stored on chain due to gas considerations).
    /// @param _arbitrator The arbitrator of the contract.
    /// @param _arbitratorDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _party The address of the party submiting the evidence. Note that 0x0 refers to evidence not submitted by any party.
    /// @param _evidence Stringified evidence object, example: '{"name" : "Justification", "description" : "Description", "fileURI" : "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"}'.
    event ModeratedEvidence(
        IArbitratorV2 indexed _arbitrator,
        uint256 indexed _arbitratorDisputeID,
        address indexed _party,
        string _evidence
    );

    /// @notice Indicate that a party has to pay a fee or would otherwise be considered as losing.
    /// @param _evidenceID The ID of the evidence being moderated.
    /// @param _currentWinner The party who is currently winning.
    event ModerationStatusChanged(bytes32 indexed _evidenceID, Party _currentWinner);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor.
    /// @param _arbitrator The trusted arbitrator to resolve potential disputes.
    /// @param _owner The trusted owner of the contract.
    /// @param _totalCostMultiplier Multiplier of arbitration fees that must be ultimately paid as fee stake. In basis points.
    /// @param _initialDepositMultiplier Multiplier of arbitration fees that must be paid as initial stake for submitting evidence. In basis points.
    /// @param _bondTimeout The time in seconds during which the last moderation status can be challenged.
    /// @param _arbitratorExtraData Extra data for the trusted arbitrator contract.
    /// @param _templateData The dispute template data.
    /// @param _templateDataMappings The dispute template data mappings.
    constructor(
        IArbitratorV2 _arbitrator,
        address _owner,
        IDisputeTemplateRegistry _templateRegistry,
        uint256 _totalCostMultiplier,
        uint256 _initialDepositMultiplier,
        uint256 _bondTimeout,
        bytes memory _arbitratorExtraData,
        string memory _templateData,
        string memory _templateDataMappings
    ) {
        arbitrator = _arbitrator;
        owner = _owner;
        templateRegistry = _templateRegistry;

        totalCostMultiplier = _totalCostMultiplier; // For example 15000, which would provide a 100% reward to the dispute winner.
        initialDepositMultiplier = _initialDepositMultiplier; // For example 63, which equals 1/16.
        bondTimeout = _bondTimeout; // For example 24 hs.

        ArbitratorData storage arbitratorData = arbitratorDataList.push();
        arbitratorData.arbitratorExtraData = _arbitratorExtraData;
        arbitratorData.disputeTemplateId = templateRegistry.setDisputeTemplate(
            "",
            _templateData,
            _templateDataMappings
        );
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    /// @notice Change the owner of the contract.
    /// @param _owner The address of the new owner.
    function changeOwner(address _owner) external onlyOwner {
        owner = _owner;
    }

    /// @notice Change the proportion of arbitration fees that must be paid as fee stake by parties when there is no winner or loser (e.g. when the arbitrator refused to rule).
    /// @param _initialDepositMultiplier Multiplier of arbitration fees that must be paid as fee stake. In basis points.
    function changeInitialDepositMultiplier(uint256 _initialDepositMultiplier) external onlyOwner {
        initialDepositMultiplier = _initialDepositMultiplier;
    }

    /// @notice Change the proportion of arbitration fees that must be paid as fee stake by the winner of the previous round.
    /// @param _totalCostMultiplier Multiplier of arbitration fees that must be paid as fee stake. In basis points.
    function changeTotalCostMultiplier(uint256 _totalCostMultiplier) external onlyOwner {
        totalCostMultiplier = _totalCostMultiplier;
    }

    /// @notice Change the time window within which evidence submissions and removals can be contested.
    /// Ongoing moderations will start using the latest bondTimeout available after calling moderate() again.
    /// @param _bondTimeout Multiplier of arbitration fees that must be paid as fee stake. In basis points.
    function changeBondTimeout(uint256 _bondTimeout) external onlyOwner {
        bondTimeout = _bondTimeout;
    }

    /// @notice Update the dispute template data.
    /// @param _templateData The new dispute template data.
    function changeDisputeTemplate(
        string calldata _templateData,
        string memory _templateDataMappings
    ) external onlyOwner {
        ArbitratorData storage arbitratorData = arbitratorDataList[arbitratorDataList.length - 1];
        uint256 newDisputeTemplateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
        arbitratorDataList.push(
            ArbitratorData({
                disputeTemplateId: newDisputeTemplateId,
                arbitratorExtraData: arbitratorData.arbitratorExtraData
            })
        );
    }

    /// @notice Change the arbitrator to be used for disputes that may be raised in the next requests. The arbitrator is trusted to support appeal period and not reenter.
    /// @param _arbitratorExtraData The extra data used by the new arbitrator.
    function changeArbitratorExtraData(bytes calldata _arbitratorExtraData) external onlyOwner {
        ArbitratorData storage arbitratorData = arbitratorDataList[arbitratorDataList.length - 1];
        arbitratorDataList.push(
            ArbitratorData({
                disputeTemplateId: arbitratorData.disputeTemplateId,
                arbitratorExtraData: _arbitratorExtraData
            })
        );
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Submits evidence.
    /// @param _evidenceGroupID Unique identifier of the evidence group the evidence belongs to. It's the submitter responsibility to submit the right evidence group ID.
    /// @param _evidence Stringified evidence object, example: '{"name" : "Justification", "description" : "Description", "fileURI" : "/ipfs/QmWQV5ZFFhEJiW8Lm7ay2zLxC2XS4wx1b2W7FfdrLMyQQc"}'.
    function submitEvidence(uint256 _evidenceGroupID, string calldata _evidence) external payable {
        // Optimization opportunity: map evidenceID to an incremental index that can be safely assumed to be less than a small uint.
        bytes32 evidenceID = keccak256(abi.encodePacked(_evidenceGroupID, _evidence));
        EvidenceData storage evidenceData = evidences[evidenceID];
        require(evidenceData.submitter == address(0x0), "Evidence already submitted.");
        evidenceData.submitter = payable(msg.sender);

        ArbitratorData storage arbitratorData = arbitratorDataList[arbitratorDataList.length - 1];

        uint256 arbitrationCost = arbitrator.arbitrationCost(arbitratorData.arbitratorExtraData);
        uint256 totalCost = (arbitrationCost * totalCostMultiplier) / MULTIPLIER_DIVISOR;
        uint256 depositRequired = (totalCost * initialDepositMultiplier) / MULTIPLIER_DIVISOR;

        Moderation storage moderation = evidenceData.moderations.push();
        // Overpaying is allowed.
        contribute(moderation, Party.Submitter, payable(msg.sender), msg.value, totalCost);
        require(moderation.paidFees[uint256(Party.Submitter)] >= depositRequired, "Insufficient funding.");
        moderation.bondDeadline = block.timestamp + bondTimeout;
        moderation.currentWinner = Party.Submitter;
        moderation.arbitratorDataID = arbitratorDataList.length - 1;

        // When evidence is submitted for a foreign arbitrable, the arbitrator field of Evidence is ignored.
        emit ModeratedEvidence(arbitrator, evidenceData.disputeID, msg.sender, _evidence);
    }

    /// @notice Moderates an evidence submission. Requires the contester to at least double the accumulated stake of the oposing party.
    /// Optimization opportunity: use `bytes calldata args` and compress _evidenceID and _side (only for optimistic rollups).
    /// @param _evidenceID Unique identifier of the evidence submission.
    /// @param _side The side to contribute to.
    function moderate(bytes32 _evidenceID, Party _side) external payable {
        EvidenceData storage evidenceData = evidences[_evidenceID];
        require(evidenceData.submitter != address(0x0), "Evidence does not exist.");
        require(!evidenceData.disputed, "Evidence already disputed.");
        require(_side != Party.None, "Invalid side.");

        Moderation storage moderation = evidenceData.moderations[evidenceData.moderations.length - 1];
        if (moderation.closed) {
            // Start another round of moderation.
            moderation = evidenceData.moderations.push();
            moderation.arbitratorDataID = arbitratorDataList.length - 1;
        }
        require(_side != moderation.currentWinner, "Only the current loser can fund.");
        require(
            block.timestamp < moderation.bondDeadline || moderation.bondDeadline == 0,
            "Moderation market is closed."
        );

        ArbitratorData storage arbitratorData = arbitratorDataList[moderation.arbitratorDataID];

        uint256 arbitrationCost = arbitrator.arbitrationCost(arbitratorData.arbitratorExtraData);
        uint256 totalCost = (arbitrationCost * totalCostMultiplier) / MULTIPLIER_DIVISOR;

        uint256 opposition = 3 - uint256(_side);
        uint256 depositRequired = moderation.paidFees[opposition] * 2;
        if (depositRequired == 0) {
            depositRequired = (totalCost * initialDepositMultiplier) / MULTIPLIER_DIVISOR;
        } else if (depositRequired > totalCost) {
            depositRequired = totalCost;
        }

        // Overpaying is allowed.
        contribute(moderation, _side, payable(msg.sender), msg.value, totalCost);
        require(moderation.paidFees[uint256(_side)] >= depositRequired, "Insufficient funding.");

        if (moderation.paidFees[uint256(_side)] >= totalCost && moderation.paidFees[opposition] >= totalCost) {
            moderation.feeRewards = moderation.feeRewards - arbitrationCost;

            evidenceData.disputeID = arbitrator.createDispute{value: arbitrationCost}(
                AMOUNT_OF_CHOICES,
                arbitratorData.arbitratorExtraData
            );
            disputeIDtoEvidenceID[evidenceData.disputeID] = _evidenceID;

            emit DisputeRequest(arbitrator, evidenceData.disputeID, arbitratorData.disputeTemplateId);
            evidenceData.disputed = true;
            moderation.bondDeadline = 0;
            moderation.currentWinner = Party.None;
        } else {
            moderation.bondDeadline = block.timestamp + bondTimeout;
            moderation.currentWinner = _side;
        }
        emit ModerationStatusChanged(_evidenceID, moderation.currentWinner);
    }

    /// @notice Resolves a moderation event once the timeout has passed.
    /// @param _evidenceID Unique identifier of the evidence submission.
    function resolveModerationMarket(bytes32 _evidenceID) external {
        // Moderation market resolutions are not final.
        // Evidence can be reported/accepted again in the future.
        // Only an arbitrator's ruling after a dispute is final.
        EvidenceData storage evidenceData = evidences[_evidenceID];
        Moderation storage moderation = evidenceData.moderations[evidenceData.moderations.length - 1];

        require(!evidenceData.disputed, "Evidence already disputed.");
        require(block.timestamp > moderation.bondDeadline, "Moderation still ongoing.");

        moderation.closed = true;
        evidenceData.ruling = moderation.currentWinner;
    }

    /// @notice Make a fee contribution.
    /// @param _moderation The moderation to contribute to.
    /// @param _side The side to contribute to.
    /// @param _contributor The contributor.
    /// @param _amount The amount contributed.
    /// @param _totalRequired The total amount required for this side.
    /// @return The amount of fees contributed.
    function contribute(
        Moderation storage _moderation,
        Party _side,
        address payable _contributor,
        uint256 _amount,
        uint256 _totalRequired
    ) internal returns (uint256) {
        uint256 contribution;
        uint256 remainingETH;
        uint256 requiredAmount = _moderation.paidFees[uint256(_side)] >= _totalRequired
            ? 0
            : _totalRequired - _moderation.paidFees[uint256(_side)];
        (contribution, remainingETH) = calculateContribution(_amount, requiredAmount);
        _moderation.contributions[_contributor][uint256(_side)] += contribution;
        _moderation.paidFees[uint256(_side)] += contribution;
        _moderation.feeRewards += contribution;

        if (remainingETH != 0) _contributor.send(remainingETH);

        return contribution;
    }

    /// @notice Returns the contribution value and remainder from available ETH and required amount.
    /// @param _available The amount of ETH available for the contribution.
    /// @param _requiredAmount The amount of ETH required for the contribution.
    /// @return taken The amount of ETH taken.
    /// @return remainder The amount of ETH left from the contribution.
    function calculateContribution(
        uint256 _available,
        uint256 _requiredAmount
    ) internal pure returns (uint256 taken, uint256 remainder) {
        if (_requiredAmount > _available) return (_available, 0); // Take whatever is available, return 0 as leftover ETH.

        remainder = _available - _requiredAmount;
        return (_requiredAmount, remainder);
    }

    /// @notice Withdraws contributions of moderations. Reimburses contributions if the appeal was not fully funded.
    ///
    /// @dev If the appeal was fully funded, sends the fee stake rewards and reimbursements proportional to the contributions made to the winner of a dispute.
    /// Optimization opportunity: use `bytes calldata args` and compress _evidenceID and _moderationID (only for optimistic rollups).
    ///
    /// @param _beneficiary The address that made contributions.
    /// @param _evidenceID The ID of the associated evidence submission.
    /// @param _moderationID The ID of the moderatino occurence.
    function withdrawFeesAndRewards(
        address payable _beneficiary,
        bytes32 _evidenceID,
        uint256 _moderationID
    ) external returns (uint256 reward) {
        EvidenceData storage evidenceData = evidences[_evidenceID];
        Moderation storage moderation = evidenceData.moderations[_moderationID];
        require(moderation.closed, "Moderation must be closed.");

        uint256[3] storage contributionTo = moderation.contributions[_beneficiary];

        if (evidenceData.ruling == Party.None) {
            // Reimburse unspent fees proportionally if there is no winner and loser.
            uint256 totalFeesPaid = moderation.paidFees[uint256(Party.Submitter)] +
                moderation.paidFees[uint256(Party.Moderator)];
            uint256 totalBeneficiaryContributions = contributionTo[uint256(Party.Submitter)] +
                contributionTo[uint256(Party.Moderator)];
            reward = totalFeesPaid > 0 ? (totalBeneficiaryContributions * moderation.feeRewards) / totalFeesPaid : 0;
        } else {
            // Reward the winner.
            uint256 paidFees = moderation.paidFees[uint256(evidenceData.ruling)];
            reward = paidFees > 0
                ? (contributionTo[uint256(evidenceData.ruling)] * moderation.feeRewards) / paidFees
                : 0;
        }
        contributionTo[uint256(Party.Submitter)] = 0;
        contributionTo[uint256(Party.Moderator)] = 0;

        _beneficiary.send(reward); // It is the user responsibility to accept ETH.
    }

    /// @inheritdoc IArbitrableV2
    function rule(uint256 _disputeID, uint256 _ruling) public override {
        bytes32 evidenceID = disputeIDtoEvidenceID[_disputeID];
        EvidenceData storage evidenceData = evidences[evidenceID];
        Moderation storage moderation = evidenceData.moderations[evidenceData.moderations.length - 1];
        require(
            evidenceData.disputed &&
                !moderation.closed &&
                msg.sender == address(arbitrator) &&
                _ruling <= AMOUNT_OF_CHOICES,
            "Ruling can't be processed."
        );

        evidenceData.ruling = Party(_ruling);
        moderation.closed = true;

        emit Ruling(arbitrator, _disputeID, _ruling);
    }

    // ************************************* //
    // *           Public Views            * //
    // ************************************* //

    /// @notice Gets the number of moderation events of the specific evidence submission.
    /// @param _evidenceID The ID of the evidence submission.
    /// @return The number of moderations.
    function getNumberOfModerations(bytes32 _evidenceID) external view returns (uint256) {
        EvidenceData storage evidenceData = evidences[_evidenceID];
        return evidenceData.moderations.length;
    }

    /// @notice Gets the contributions made by a party for a given moderation.
    /// @param _evidenceID The ID of the evidence submission.
    /// @param _moderationID The ID of the moderation occurence.
    /// @param _contributor The address of the contributor.
    /// @return contributions The contributions.
    function getContributions(
        bytes32 _evidenceID,
        uint256 _moderationID,
        address _contributor
    ) external view returns (uint256[3] memory contributions) {
        EvidenceData storage evidenceData = evidences[_evidenceID];
        Moderation storage moderation = evidenceData.moderations[_moderationID];
        contributions = moderation.contributions[_contributor];
    }

    /// @notice Gets the information of a moderation event.
    /// @param _evidenceID The ID of the evidence submission.
    /// @param _moderationID The ID of the moderation occurence.
    /// @return paidFees currentWinner feeRewards The moderation information.
    function getModerationInfo(
        bytes32 _evidenceID,
        uint256 _moderationID
    ) external view returns (uint256[3] memory paidFees, Party currentWinner, uint256 feeRewards) {
        EvidenceData storage evidenceData = evidences[_evidenceID];
        Moderation storage moderation = evidenceData.moderations[_moderationID];
        return (moderation.paidFees, moderation.currentWinner, moderation.feeRewards);
    }

    /// @notice Gets the last arbitrator data index, which is used for current new submissions.
    /// @return The last arbitrator data index.
    function getCurrentArbitratorIndex() external view returns (uint256) {
        return arbitratorDataList.length - 1;
    }
}
