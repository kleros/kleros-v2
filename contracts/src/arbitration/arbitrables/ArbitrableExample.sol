// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../IArbitrable.sol";
import "../../evidence/IMetaEvidence.sol";

/// @title ArbitrableExample
/// An example of an arbitrable contract which connects to the arbitator that implements the updated interface.
contract ArbitrableExample is IArbitrable, IMetaEvidence {
    struct DisputeStruct {
        bool isRuled; // Whether the dispute has been ruled or not.
        uint256 ruling; // Ruling given by the arbitrator.
        uint256 numberOfRulingOptions; // The number of choices the arbitrator can give.
    }

    address public immutable governor;
    IArbitrator public arbitrator; // Arbitrator is set in constructor and never changed.
    ERC20 public immutable weth; // The WETH token.
    mapping(uint256 => uint256) public externalIDtoLocalID; // Maps external (arbitrator side) dispute IDs to local dispute IDs.
    DisputeStruct[] public disputes; // Stores the disputes' info. disputes[disputeID].

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //

    /// @dev Constructor
    /// @param _arbitrator The arbitrator to rule on created disputes.
    /// @param _metaEvidenceID Unique identifier of meta-evidence.
    /// @param _metaEvidence The URI of the meta evidence object for evidence submissions requests.
    constructor(IArbitrator _arbitrator, uint256 _metaEvidenceID, string memory _metaEvidence, ERC20 _weth) {
        governor = msg.sender;
        arbitrator = _arbitrator;
        weth = _weth;
        emit DisputeTemplate(disputeTemplates++, "", _templateData);
    }

    // ************************************* //
    // *             Governance            * //
    // ************************************* //

    function changeMetaEvidence(uint256 _metaEvidenceID, string memory _metaEvidence) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        emit MetaEvidence(_metaEvidenceID, _metaEvidence);
    }

    function changeArbitrator(IArbitrator _arbitrator) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        arbitrator = _arbitrator;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

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

        require(weth.safeTransferFrom(msg.sender, address(this), _feeInWeth), "Transfer failed");
        require(weth.increaseAllowance(address(arbitrator), _feeInWeth), "Allowance increase failed");

        disputeID = arbitrator.createDispute(numberOfRulingOptions, _arbitratorExtraData, weth, _feeInWeth);
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

    function changeMetaEvidence(uint256 _metaEvidenceID, string memory _metaEvidence) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        emit MetaEvidence(_metaEvidenceID, _metaEvidence);
    }

    function changeArbitrator(IArbitrator _arbitrator) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        arbitrator = _arbitrator;
    }
}
