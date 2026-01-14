// SPDX-License-Identifier: MIT

import {IArbitrableV2} from "../interfaces/IArbitrableV2.sol";
import {IArbitratorV2} from "../interfaces/IArbitratorV2.sol";
import {IDisputeTemplateRegistry} from "../interfaces/IDisputeTemplateRegistry.sol";

pragma solidity ^0.8.24;

/// @title DisputeResolver
/// @notice DisputeResolver contract
/// @dev Adapted for V2 from https://github.com/kleros/arbitrable-proxy-contracts/blob/master/contracts/ArbitrableProxy.sol.
contract DisputeResolver is IArbitrableV2 {
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

    address public owner; // The owner.
    IArbitratorV2 public arbitrator; // The arbitrator.
    IDisputeTemplateRegistry public templateRegistry; // The dispute template registry.
    DisputeStruct[] public disputes; // Local disputes.
    mapping(uint256 => uint256) public arbitratorDisputeIDToLocalID; // Maps arbitrator-side dispute IDs to local dispute IDs.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByOwner() {
        if (owner != msg.sender) revert OwnerOnly();
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor
    /// @param _arbitrator Target global arbitrator for any disputes.
    /// @param _templateRegistry The dispute template registry.
    constructor(IArbitratorV2 _arbitrator, IDisputeTemplateRegistry _templateRegistry) {
        owner = msg.sender;
        arbitrator = _arbitrator;
        templateRegistry = _templateRegistry;
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /// @notice Changes the owner.
    /// @param _owner The address of the new owner.
    function changeOwner(address _owner) external onlyByOwner {
        owner = _owner;
    }

    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyByOwner {
        arbitrator = _arbitrator;
    }

    function changeTemplateRegistry(IDisputeTemplateRegistry _templateRegistry) external onlyByOwner {
        templateRegistry = _templateRegistry;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Calls createDispute function of the specified arbitrator to create a dispute.
    /// @dev No need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
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
                _numberOfRulingOptions
            );
    }

    /// @inheritdoc IArbitrableV2
    function rule(uint256 _arbitratorDisputeID, uint256 _ruling) external override {
        uint256 localDisputeID = arbitratorDisputeIDToLocalID[_arbitratorDisputeID];
        DisputeStruct storage dispute = disputes[localDisputeID];
        if (msg.sender != address(arbitrator)) revert ArbitratorOnly();
        if (_ruling > dispute.numberOfRulingOptions) revert RulingOutOfBounds();
        if (dispute.isRuled) revert DisputeAlreadyRuled();

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
        uint256 _numberOfRulingOptions
    ) internal virtual returns (uint256 arbitratorDisputeID) {
        if (_numberOfRulingOptions <= 1) revert ShouldBeAtLeastTwoRulingOptions();

        arbitratorDisputeID = arbitrator.createDispute{value: msg.value}(_numberOfRulingOptions, _arbitratorExtraData);
        uint256 localDisputeID = disputes.length;
        disputes.push(
            DisputeStruct({
                arbitratorExtraData: _arbitratorExtraData,
                isRuled: false,
                ruling: 0,
                numberOfRulingOptions: _numberOfRulingOptions
            })
        );
        arbitratorDisputeIDToLocalID[arbitratorDisputeID] = localDisputeID;
        uint256 templateId = templateRegistry.setDisputeTemplate("", _disputeTemplate, _disputeTemplateDataMappings);
        emit DisputeRequest(arbitrator, arbitratorDisputeID, templateId);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error ArbitratorOnly();
    error RulingOutOfBounds();
    error DisputeAlreadyRuled();
    error ShouldBeAtLeastTwoRulingOptions();
}
