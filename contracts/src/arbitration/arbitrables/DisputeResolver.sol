// SPDX-License-Identifier: MIT

/// @custom:authors: [@ferittuncer, @unknownunknown1, @jaybuidl]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []

import {IArbitrableV2, IArbitratorV2} from "../interfaces/IArbitrableV2.sol";
import "../interfaces/IDisputeTemplateRegistry.sol";
import "../../proxy/UUPSProxiable.sol";
import "../../proxy/Initializable.sol";

pragma solidity 0.8.24;

/// @title DisputeResolver
/// DisputeResolver contract adapted for V2 from https://github.com/kleros/arbitrable-proxy-contracts/blob/master/contracts/ArbitrableProxy.sol.
contract DisputeResolver is IArbitrableV2, UUPSProxiable, Initializable {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DisputeStruct {
        bytes arbitratorExtraData; // Extra data for the dispute.
        bool isRuled; // True if the dispute has been ruled.
        uint256 ruling; // Ruling given to the dispute.
        uint256 numberOfRulingOptions; // The number of choices the arbitrator can give.
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor.
    IArbitratorV2 public arbitrator; // The arbitrator.
    IDisputeTemplateRegistry public templateRegistry; // The dispute template registry.
    DisputeStruct[] public disputes; // Local disputes.
    mapping(uint256 => uint256) public arbitratorDisputeIDToLocalID; // Maps arbitrator-side dispute IDs to local dispute IDs.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(address(governor) == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor, initializing the implementation to reduce attack surface.
    constructor() {
        _disableInitializers();
    }

    /// @dev Constructor
    /// @param _arbitrator Target global arbitrator for any disputes.
    function initialize(
        IArbitratorV2 _arbitrator,
        IDisputeTemplateRegistry _templateRegistry
    ) external reinitializer(1) {
        governor = msg.sender;
        arbitrator = _arbitrator;
        templateRegistry = _templateRegistry;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /**
     * @dev Access Control to perform implementation upgrades (UUPS Proxiable)
     * @dev Only the governor can perform upgrades (`onlyByGovernor`)
     */
    function _authorizeUpgrade(address) internal view override onlyByGovernor {
        // NOP
    }

    /// @dev Changes the governor.
    /// @param _governor The address of the new governor.
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyByGovernor {
        arbitrator = _arbitrator;
    }

    function changeTemplateRegistry(IDisputeTemplateRegistry _templateRegistry) external onlyByGovernor {
        templateRegistry = _templateRegistry;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Calls createDispute function of the specified arbitrator to create a dispute.
    /// Note that we don’t need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _arbitratorExtraData Extra data for the arbitrator of the dispute.
    /// @param _disputeTemplate Dispute template.
    /// @param _disputeTemplateDataMappings The data mappings.
    /// @param _numberOfRulingOptions Number of ruling options.
    /// @return disputeID Dispute id (on arbitrator side) of the created dispute.
    function createDisputeForTemplate(
        bytes calldata _arbitratorExtraData,
        string calldata _disputeTemplate,
        string memory _disputeTemplateDataMappings,
        uint256 _numberOfRulingOptions
    ) external payable returns (uint256 disputeID) {
        return
            _createDispute(
                _arbitratorExtraData,
                _disputeTemplate,
                _disputeTemplateDataMappings,
                "",
                _numberOfRulingOptions
            );
    }

    /// @dev Calls createDispute function of the specified arbitrator to create a dispute.
    /// Note that we don’t need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _arbitratorExtraData Extra data for the arbitrator of the dispute.
    /// @param _disputeTemplateUri The URI to the dispute template. For example on IPFS: starting with '/ipfs/'.
    /// @param _numberOfRulingOptions Number of ruling options.
    /// @return disputeID Dispute id (on arbitrator side) of the created dispute.
    function createDisputeForTemplateUri(
        bytes calldata _arbitratorExtraData,
        string calldata _disputeTemplateUri,
        uint256 _numberOfRulingOptions
    ) external payable returns (uint256 disputeID) {
        return _createDispute(_arbitratorExtraData, "", "", _disputeTemplateUri, _numberOfRulingOptions);
    }

    /// @dev To be called by the arbitrator of the dispute, to declare the winning ruling.
    /// @param _arbitratorDisputeID ID of the dispute in arbitrator contract.
    /// @param _ruling The ruling choice of the arbitration.
    function rule(uint256 _arbitratorDisputeID, uint256 _ruling) external override {
        uint256 localDisputeID = arbitratorDisputeIDToLocalID[_arbitratorDisputeID];
        DisputeStruct storage dispute = disputes[localDisputeID];
        require(msg.sender == address(arbitrator), "Only the arbitrator can execute this.");
        require(_ruling <= dispute.numberOfRulingOptions, "Invalid ruling.");
        require(!dispute.isRuled, "This dispute has been ruled already.");

        dispute.isRuled = true;
        dispute.ruling = _ruling;

        emit Ruling(IArbitratorV2(msg.sender), _arbitratorDisputeID, dispute.ruling);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function _createDispute(
        bytes calldata _arbitratorExtraData,
        string memory _disputeTemplate,
        string memory _disputeTemplateDataMappings,
        string memory _disputeTemplateUri,
        uint256 _numberOfRulingOptions
    ) internal returns (uint256 disputeID) {
        require(_numberOfRulingOptions > 1, "Should be at least 2 ruling options.");

        disputeID = arbitrator.createDispute{value: msg.value}(_numberOfRulingOptions, _arbitratorExtraData);
        uint256 localDisputeID = disputes.length;
        disputes.push(
            DisputeStruct({
                arbitratorExtraData: _arbitratorExtraData,
                isRuled: false,
                ruling: 0,
                numberOfRulingOptions: _numberOfRulingOptions
            })
        );
        arbitratorDisputeIDToLocalID[disputeID] = localDisputeID;
        uint256 templateId = templateRegistry.setDisputeTemplate("", _disputeTemplate, _disputeTemplateDataMappings);
        emit DisputeRequest(arbitrator, disputeID, localDisputeID, templateId, _disputeTemplateUri);
    }
}
