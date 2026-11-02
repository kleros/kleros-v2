// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {IArbitrableV2} from "../interfaces/IArbitrableV2.sol";
import {IArbitratorV2} from "../interfaces/IArbitratorV2.sol";
import {IDisputeTemplateRegistry} from "../interfaces/IDisputeTemplateRegistry.sol";
import {SafeERC20} from "../../libraries/SafeERC20.sol";

/// @title ArbitrableExample
/// @notice An example of an arbitrable contract which connects to the arbitator that implements the updated interface.
contract ArbitrableExample is IArbitrableV2 {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DisputeStruct {
        bool isRuled; // Whether the dispute has been ruled or not.
        uint256 ruling; // Ruling given by the arbitrator.
        uint256 numberOfRulingOptions; // The number of choices the arbitrator can give.
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event Action(string indexed _action);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public immutable owner;
    IArbitratorV2 public arbitrator; // Arbitrator is set in constructor.
    IDisputeTemplateRegistry public templateRegistry; // The dispute template registry.
    uint256 public templateId; // The current dispute template identifier.
    bytes public arbitratorExtraData; // Extra data to set up the arbitration.
    mapping(uint256 => uint256) public externalIDtoLocalID; // Maps external (arbitrator side) dispute IDs to local dispute IDs.
    DisputeStruct[] public disputes; // Stores the disputes' info. disputes[disputeID].

    uint256 public numberOfRulingOptions = 2;

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyOwner() {
        require(owner == msg.sender, OwnerOnly());
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @notice Constructor
    /// @param _arbitrator The arbitrator to rule on created disputes.
    /// @param _templateData The dispute template data.
    /// @param _templateDataMappings The dispute template data mappings.
    /// @param _arbitratorExtraData The extra data for the arbitrator.
    /// @param _templateRegistry The dispute template registry.
    constructor(
        IArbitratorV2 _arbitrator,
        string memory _templateData,
        string memory _templateDataMappings,
        bytes memory _arbitratorExtraData,
        IDisputeTemplateRegistry _templateRegistry
    ) {
        owner = msg.sender;
        arbitrator = _arbitrator;
        arbitratorExtraData = _arbitratorExtraData;
        templateRegistry = _templateRegistry;

        templateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyOwner {
        arbitrator = _arbitrator;
    }

    function changeArbitratorExtraData(bytes calldata _arbitratorExtraData) external onlyOwner {
        arbitratorExtraData = _arbitratorExtraData;
    }

    function changeTemplateRegistry(IDisputeTemplateRegistry _templateRegistry) external onlyOwner {
        templateRegistry = _templateRegistry;
    }

    function changeDisputeTemplate(
        string memory _templateData,
        string memory _templateDataMappings
    ) external onlyOwner {
        templateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
    }

    function changeNumberOfRulingOptions(uint256 _numberOfRulingOptions) external onlyOwner {
        numberOfRulingOptions = _numberOfRulingOptions;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @notice Calls createDispute function of the specified arbitrator to create a dispute.
    /// @dev No need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _action The action that requires arbitration.
    /// @return disputeID Dispute id (on arbitrator side) of the dispute created.
    function createDispute(string calldata _action) external payable returns (uint256 disputeID) {
        emit Action(_action);

        uint256 localDisputeID = disputes.length;
        disputes.push(DisputeStruct({isRuled: false, ruling: 0, numberOfRulingOptions: numberOfRulingOptions}));

        disputeID = arbitrator.createDispute{value: msg.value}(numberOfRulingOptions, arbitratorExtraData);
        externalIDtoLocalID[disputeID] = localDisputeID;

        emit DisputeRequest(arbitrator, disputeID, templateId);
    }

    /// @notice Give a ruling for a dispute.
    ///
    /// @dev This is a callback function for the arbitrator to provide the ruling to this contract.
    /// Only the arbitrator must be allowed to call this function.
    /// Ruling 0 is reserved for "Not able/wanting to make a decision".
    ///
    /// @param _arbitratorDisputeID The identifier of the dispute in the Arbitrator contract.
    /// @param _ruling Ruling given by the arbitrator.
    function rule(uint256 _arbitratorDisputeID, uint256 _ruling) external virtual {
        uint256 localDisputeID = externalIDtoLocalID[_arbitratorDisputeID];
        DisputeStruct storage dispute = disputes[localDisputeID];
        require(msg.sender == address(arbitrator), ArbitratorOnly());
        require(_ruling <= dispute.numberOfRulingOptions, RulingOutOfBounds());
        require(!dispute.isRuled, DisputeAlreadyRuled());

        dispute.isRuled = true;
        dispute.ruling = _ruling;

        emit Ruling(IArbitratorV2(msg.sender), _arbitratorDisputeID, dispute.ruling);
    }

    // ************************************* //
    // *              Errors               * //
    // ************************************* //

    error OwnerOnly();
    error TransferFailed();
    error AllowanceIncreaseFailed();
    error ArbitratorOnly();
    error RulingOutOfBounds();
    error DisputeAlreadyRuled();
}
