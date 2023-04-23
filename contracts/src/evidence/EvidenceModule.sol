// SPDX-License-Identifier: MIT

/**
 *  @authors: [@fnanni-0]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 *  @tools: []
 */

/**
 * @title Implementation of the Evidence Standard for cross-chain submissions
 */

pragma solidity ^0.8;

// TODO: standard interfaces should be placed in a separated repo (?)
import "../arbitration/IArbitrator.sol";

contract EvidenceModule {
    IArbitrator public arbitrator;

    event Evidence(
        IArbitrator indexed _arbitrator,
        uint256 indexed _evidenceGroupID,
        address indexed _party,
        string _evidence
    );

    constructor(IArbitrator _arbitrator) {
        arbitrator = _arbitrator;
    }

    /** @dev Submits evidence.
     *  @param _evidenceGroupID Unique identifier of the evidence group the evidence belongs to. It's the submitter responsability to submit the right evidence group ID.
     *  @param _evidence IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'.
     */
    function submitEvidence(
        uint256 _evidenceGroupID,
        string calldata _evidence
    ) external {
        emit Evidence(arbitrator, _evidenceGroupID, msg.sender, _evidence);
    }
}
