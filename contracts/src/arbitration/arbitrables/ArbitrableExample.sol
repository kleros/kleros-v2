// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "../IArbitrable.sol";
import "../../evidence/IMetaEvidence.sol";

/**
 *  @title ArbitrableExample
 *  An example of an arbitrable contract which connects to the arbitator that implements the updated interface.
 */
contract ArbitrableExample is IArbitrable, IMetaEvidence {
    struct DisputeStruct {
        bool isRuled; // Whether the dispute has been ruled or not.
        uint256 ruling; // Ruling given by the arbitrator.
        uint256 numberOfRulingOptions; // The number of choices the arbitrator can give.
    }

    uint256 META_EVIDENCE_ID = 0;
    address public governor;
    IArbitrator public immutable arbitrator; // Arbitrator is set in constructor and never changed.
    mapping(uint256 => uint256) public externalIDtoLocalID; // Maps external (arbitrator side) dispute IDs to local dispute IDs.
    DisputeStruct[] public disputes; // Stores the disputes' info. disputes[disputeID].

    /** @dev Constructor
     *  @param _arbitrator The arbitrator to rule on created disputes.
     *  @param _metaEvidence The URI of the meta evidence object for evidence submissions requests.
     */
    constructor(IArbitrator _arbitrator, string memory _metaEvidence) {
        governor = msg.sender;
        arbitrator = _arbitrator;
        emit MetaEvidence(META_EVIDENCE_ID, _metaEvidence);
    }

    /** @dev TRUSTED. Calls createDispute function of the specified arbitrator to create a dispute.
        Note that we don’t need to check that msg.value is enough to pay arbitration fees as it’s the responsibility of the arbitrator contract.
     *  @param _numberOfRulingOptions Number of ruling options. Must be greater than 1, otherwise there is nothing to choose from.
     *  @param _arbitratorExtraData Extra data for the arbitrator.
     *  @param _evidenceGroupID Unique identifier of the evidence group that is linked to this dispute.
     *  @return disputeID Dispute id (on arbitrator side) of the dispute created.
     */
    function createDispute(
        uint256 _numberOfRulingOptions,
        bytes calldata _arbitratorExtraData,
        uint256 _evidenceGroupID
    ) external payable returns (uint256 disputeID) {
        require(_numberOfRulingOptions > 1, "Incorrect number of choices");

        uint256 localDisputeID = disputes.length;
        disputes.push(DisputeStruct({isRuled: false, ruling: 0, numberOfRulingOptions: _numberOfRulingOptions}));

        disputeID = arbitrator.createDispute{value: msg.value}(_numberOfRulingOptions, _arbitratorExtraData);

        externalIDtoLocalID[disputeID] = localDisputeID;

        emit Dispute(arbitrator, disputeID, META_EVIDENCE_ID, _evidenceGroupID);
    }

    /** @dev To be called by the arbitrator of the dispute, to declare the winning ruling.
     *  @param _externalDisputeID ID of the dispute in arbitrator contract.
     *  @param _ruling The ruling choice of the arbitration.
     */
    function rule(uint256 _externalDisputeID, uint256 _ruling) external override {
        uint256 localDisputeID = externalIDtoLocalID[_externalDisputeID];
        DisputeStruct storage dispute = disputes[localDisputeID];
        require(msg.sender == address(arbitrator), "Only the arbitrator can execute this.");
        require(_ruling <= dispute.numberOfRulingOptions, "Invalid ruling.");
        require(dispute.isRuled == false, "This dispute has been ruled already.");

        dispute.isRuled = true;
        dispute.ruling = _ruling;

        emit Ruling(IArbitrator(msg.sender), _externalDisputeID, dispute.ruling);
    }

    function changedMetaEvidence(string memory _metaEvidence) external {
        require(msg.sender == governor, "Not authorized: governor only.");
        emit MetaEvidence(++META_EVIDENCE_ID, _metaEvidence);
    }
}
