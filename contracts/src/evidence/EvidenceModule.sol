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
import "./IEvidence.sol";
import "../arbitration/IArbitrator.sol";

contract EvidenceModule is IEvidence {
    IArbitrator private constant NULL_ARBITRATOR = IArbitrator(address(0x0));

    constructor() {}

    /** @dev Submits evidence.
     *  @param _evidenceGroupID Unique identifier of the evidence group the evidence belongs to. It's the submitter responsability to submit the right evidence group ID.
     *  @param _evidence IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'.
     */
    function submitEvidence(uint256 _evidenceGroupID, string calldata _evidence) external {
        emit Evidence(NULL_ARBITRATOR, _evidenceGroupID, msg.sender, _evidence);
    }
}
