// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IArbitrableV2, IArbitratorV2} from "../IArbitrableV2.sol";

/// @title ArbitrableExample
/// An example of an arbitrable contract which connects to the arbitator that implements the updated interface.
contract ArbitrableExample is IArbitrableV2 {
    struct DisputeStruct {
        bool isRuled; // Whether the dispute has been ruled or not.
        uint256 ruling; // Ruling given by the arbitrator.
        uint256 numberOfRulingOptions; // The number of choices the arbitrator can give.
    }

    event Action(string indexed _action);

    address public immutable governor;
    IArbitratorV2 public arbitrator; // Arbitrator is set in constructor.
    uint256 public disputeTemplates; // The number of dispute templates created.
    ERC20 public immutable weth; // The WETH token.
    mapping(uint256 => uint256) public externalIDtoLocalID; // Maps external (arbitrator side) dispute IDs to local dispute IDs.
    DisputeStruct[] public disputes; // Stores the disputes' info. disputes[disputeID].

    /// @dev Constructor
    /// @param _arbitrator The arbitrator to rule on created disputes.
    /// @param _templateData The dispute template data.
    /// @param _weth The WETH token.
    constructor(IArbitratorV2 _arbitrator, string memory _templateData, ERC20 _weth) {
        governor = msg.sender;
        arbitrator = _arbitrator;
        weth = _weth;
        emit DisputeTemplate(disputeTemplates++, "", _templateData);
    }

    /// @dev Calls createDispute function of the specified arbitrator to create a dispute.
    /// Note that we don’t need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _templateId The identifier of the dispute template. Should not be used with _templateUri.
    /// @param _action The action that requires arbitration.
    /// @param _arbitratorExtraData Extra data for the arbitrator.
    /// @return disputeID Dispute id (on arbitrator side) of the dispute created.
    function createDispute(
        uint256 _templateId,
        string calldata _action,
        bytes calldata _arbitratorExtraData
    ) external payable returns (uint256 disputeID) {
        emit Action(_action);

        uint256 numberOfRulingOptions = 2;
        uint256 localDisputeID = disputes.length;
        disputes.push(DisputeStruct({isRuled: false, ruling: 0, numberOfRulingOptions: numberOfRulingOptions}));

        disputeID = arbitrator.createDispute{value: msg.value}(numberOfRulingOptions, _arbitratorExtraData);
        externalIDtoLocalID[disputeID] = localDisputeID;

        uint256 externalDisputeID = uint256(keccak256(abi.encodePacked(_action)));
        emit DisputeRequest(arbitrator, disputeID, externalDisputeID, _templateId, "");
    }

    /// @dev Calls createDispute function of the specified arbitrator to create a dispute.
    /// Note that we don’t need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
    /// @param _templateId The identifier of the dispute template. Should not be used with _templateUri.
    /// @param _action The action that requires arbitration.
    /// @param _arbitratorExtraData Extra data for the arbitrator.
    /// @param _feeInWeth Amount of fees in WETH for the arbitrator.
    /// @return disputeID Dispute id (on arbitrator side) of the dispute created.
    function createDispute(
        uint256 _templateId,
        string calldata _action,
        bytes calldata _arbitratorExtraData,
        uint256 _feeInWeth
    ) external payable returns (uint256 disputeID) {
        emit Action(_action);

        uint256 numberOfRulingOptions = 2;
        uint256 localDisputeID = disputes.length;
        disputes.push(DisputeStruct({isRuled: false, ruling: 0, numberOfRulingOptions: numberOfRulingOptions}));

        require(weth.transferFrom(msg.sender, address(this), _feeInWeth), "Not enough WETH for arbitration");
        weth.increaseAllowance(address(arbitrator), _feeInWeth);
        disputeID = arbitrator.createDispute(numberOfRulingOptions, _arbitratorExtraData);
        externalIDtoLocalID[disputeID] = localDisputeID;

        uint256 externalDisputeID = uint256(keccak256(abi.encodePacked(_action)));
        emit DisputeRequest(arbitrator, disputeID, externalDisputeID, _templateId, "");
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

    function changeDisputeTemplate(string memory _templateData) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        emit DisputeTemplate(disputeTemplates++, "", _templateData);
    }

    function changeArbitrator(IArbitratorV2 _arbitrator) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        arbitrator = _arbitrator;
    }
}
