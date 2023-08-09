// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {IArbitrableV2, IArbitratorV2} from "../interfaces/IArbitrableV2.sol";
import "../interfaces/IDisputeTemplateRegistry.sol";
import "../../libraries/SafeERC20.sol";

/// @title ArbitrableExample
/// An example of an arbitrable contract which connects to the arbitator that implements the updated interface.
contract ArbitrableExample is IArbitrableV2 {
    using SafeERC20 for IERC20;

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct DisputeStruct {
        bool isRuled; // Whether the dispute has been ruled or not.
        uint256 ruling; // Ruling given by the arbitrator.
        uint256 numberOfRulingOptions; // The number of choices the arbitrator can give.
    }

    event Action(string indexed _action);

    address public immutable governor;
    IArbitratorV2 public arbitrator; // Arbitrator is set in constructor.
    IDisputeTemplateRegistry public templateRegistry; // The dispute template registry.
    uint256 public templateId; // The current dispute template identifier.
    bytes public arbitratorExtraData; // Extra data to set up the arbitration.
    IERC20 public immutable weth; // The WETH token.
    mapping(uint256 => uint256) public externalIDtoLocalID; // Maps external (arbitrator side) dispute IDs to local dispute IDs.
    DisputeStruct[] public disputes; // Stores the disputes' info. disputes[disputeID].

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(address(this) == msg.sender, "Only the governor allowed.");
        _;
    }

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor
    /// @param _arbitrator The arbitrator to rule on created disputes.
    /// @param _templateData The dispute template data.
    /// @param _templateDataMappings The dispute template data mappings.
    /// @param _arbitratorExtraData The extra data for the arbitrator.
    /// @param _templateRegistry The dispute template registry.
    /// @param _weth The WETH token.
    constructor(
        IArbitratorV2 _arbitrator,
        string memory _templateData,
        string memory _templateDataMappings,
        bytes memory _arbitratorExtraData,
        IDisputeTemplateRegistry _templateRegistry,
        IERC20 _weth
    ) {
        governor = msg.sender;
        arbitrator = _arbitrator;
        arbitratorExtraData = _arbitratorExtraData;
        templateRegistry = _templateRegistry;
        weth = _weth;

        templateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeArbitrator(IArbitratorV2 _arbitrator) external onlyByGovernor {
        arbitrator = _arbitrator;
    }

    function changeArbitratorExtraData(bytes calldata _arbitratorExtraData) external onlyByGovernor {
        arbitratorExtraData = _arbitratorExtraData;
    }

    function changeTemplateRegistry(IDisputeTemplateRegistry _templateRegistry) external onlyByGovernor {
        templateRegistry = _templateRegistry;
    }

    function changeDisputeTemplate(
        string memory _templateData,
        string memory _templateDataMappings
    ) external onlyByGovernor {
        templateId = templateRegistry.setDisputeTemplate("", _templateData, _templateDataMappings);
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /// @dev Calls createDispute function of the specified arbitrator to create a dispute.
    /// Note that we don’t need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _action The action that requires arbitration.
    /// @return disputeID Dispute id (on arbitrator side) of the dispute created.
    function createDispute(string calldata _action) external payable returns (uint256 disputeID) {
        emit Action(_action);

        uint256 numberOfRulingOptions = 2;
        uint256 localDisputeID = disputes.length;
        disputes.push(DisputeStruct({isRuled: false, ruling: 0, numberOfRulingOptions: numberOfRulingOptions}));

        disputeID = arbitrator.createDispute{value: msg.value}(numberOfRulingOptions, arbitratorExtraData);
        externalIDtoLocalID[disputeID] = localDisputeID;

        uint256 externalDisputeID = uint256(keccak256(abi.encodePacked(_action)));
        emit DisputeRequest(arbitrator, disputeID, externalDisputeID, templateId, "");
    }

    /// @dev Calls createDispute function of the specified arbitrator to create a dispute.
    /// Note that we don’t need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _action The action that requires arbitration.
    /// @param _feeInWeth Amount of fees in WETH for the arbitrator.
    /// @return disputeID Dispute id (on arbitrator side) of the dispute created.
    function createDispute(string calldata _action, uint256 _feeInWeth) external returns (uint256 disputeID) {
        emit Action(_action);

        uint256 numberOfRulingOptions = 2;
        uint256 localDisputeID = disputes.length;
        disputes.push(DisputeStruct({isRuled: false, ruling: 0, numberOfRulingOptions: numberOfRulingOptions}));

        require(weth.safeTransferFrom(msg.sender, address(this), _feeInWeth), "Transfer failed");
        require(weth.increaseAllowance(address(arbitrator), _feeInWeth), "Allowance increase failed");

        disputeID = arbitrator.createDispute(numberOfRulingOptions, arbitratorExtraData, weth, _feeInWeth);
        externalIDtoLocalID[disputeID] = localDisputeID;

        uint256 externalDisputeID = uint256(keccak256(abi.encodePacked(_action)));
        emit DisputeRequest(arbitrator, disputeID, externalDisputeID, templateId, "");
    }

    /// @dev To be called by the arbitrator of the dispute, to declare the winning ruling.
    /// @param _externalDisputeID ID of the dispute in arbitrator contract.
    /// @param _ruling The ruling choice of the arbitration.
    function rule(uint256 _externalDisputeID, uint256 _ruling) external override {
        uint256 localDisputeID = externalIDtoLocalID[_externalDisputeID];
        DisputeStruct storage dispute = disputes[localDisputeID];
        require(msg.sender == address(arbitrator), "Only the arbitrator can execute this.");
        require(_ruling <= dispute.numberOfRulingOptions, "Invalid ruling.");
        require(dispute.isRuled == false, "This dispute has been ruled already.");

        dispute.isRuled = true;
        dispute.ruling = _ruling;

        emit Ruling(IArbitratorV2(msg.sender), _externalDisputeID, dispute.ruling);
    }
}
