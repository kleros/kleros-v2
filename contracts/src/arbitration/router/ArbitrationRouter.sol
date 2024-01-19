// SPDX-License-Identifier: MIT

/// @authors: [@jaybuidl]
/// @reviewers: []
/// @auditors: []
/// @bounties: []

pragma solidity 0.8.18;

import {IArbitrableV2, IArbitratorV2} from "../interfaces/IArbitrableV2.sol";
import {IDisputeTemplateRegistry} from "../interfaces/IDisputeTemplateRegistry.sol";
import {IEvidence} from "../interfaces/IEvidence.sol";

/// @title Router for arbitrable contracts to interact with arbitrators.
contract ArbitrationRouter {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
    IArbitratorV2 public arbitrator; // The arbitrator.
    IDisputeTemplateRegistry public disputeTemplateRegistry; // The dispute template registry.
    IEvidence public evidenceModule; // The evidence module.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        if (governor != msg.sender) revert GovernorOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    constructor(
        IArbitratorV2 _arbitrator,
        IDisputeTemplateRegistry _disputeTemplateRegistry,
        IEvidence _evidenceModule
    ) {
        governor = msg.sender;
        arbitrator = _arbitrator;
        disputeTemplateRegistry = _disputeTemplateRegistry;
        evidenceModule = _evidenceModule;
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    function changeDisputeTemplateRegistry(IDisputeTemplateRegistry _disputeTemplateRegistry) external onlyByGovernor {
        disputeTemplateRegistry = _disputeTemplateRegistry;
    }

    function changeEvidenceModule(IEvidence _evidenceModule) external onlyByGovernor {
        evidenceModule = _evidenceModule;
    }

    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyByGovernor {
        arbitrator = _arbitrator;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Creates a new dispute template.
    /// @param _templateTag An optional tag for the dispute template, such as "registration" or "removal".
    /// @param _templateData The template data.
    /// @param _templateDataMappings The data mappings.
    /// @return templateId The identifier of the dispute template.
    function setDisputeTemplate(
        string memory _templateTag,
        string memory _templateData,
        string memory _templateDataMappings
    ) external returns (uint256 templateId) {
        // WARNING: msg.sender will be incorrect in the dispute template registry!
        templateId = disputeTemplateRegistry.setDisputeTemplate(_templateTag, _templateData, _templateDataMappings);
    }

    /// @dev Submits evidence for a dispute.
    /// @param _externalDisputeID Unique identifier for this dispute outside Kleros. It's the submitter responsability to submit the right evidence group ID.
    /// @param _evidence IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'.
    function submitEvidence(uint256 _externalDisputeID, string calldata _evidence) external {
        // WARNING: msg.sender will be incorrect in the evidence module!
        evidenceModule.submitEvidence(_externalDisputeID, _evidence);
    }

    /// @dev Compute the cost of arbitration denominated in the native currency, typically ETH.
    ///      It is recommended not to increase it often, as it can be highly time and gas consuming for the arbitrated contracts to cope with fee augmentation.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return cost The arbitration cost in ETH.
    function arbitrationCost(bytes calldata _extraData) external view returns (uint256 cost) {
        // WARNING: msg.sender will be incorrect in the evidence module!
        cost = arbitrator.arbitrationCost(_extraData);
    }

    /// @dev Create a dispute and pay for the fees in the native currency, typically ETH.
    ///      Must be called by the arbitrable contract.
    ///      Must pay at least arbitrationCost(_extraData).
    /// @param _numberOfChoices The number of choices the arbitrator can choose from in this dispute.
    /// @param _extraData Additional info about the dispute. We use it to pass the ID of the dispute's court (first 32 bytes), the minimum number of jurors required (next 32 bytes) and the ID of the specific dispute kit (last 32 bytes).
    /// @return disputeID The identifier of the dispute created.
    function createDispute(
        uint256 _numberOfChoices,
        bytes calldata _extraData
    ) external payable returns (uint256 disputeID) {
        // WARNING: msg.sender will be incorrect in the evidence module!
        disputeID = arbitrator.createDispute{value: msg.value}(_numberOfChoices, _extraData);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error GovernorOnly();
}
