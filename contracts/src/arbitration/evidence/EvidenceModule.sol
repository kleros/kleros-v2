// SPDX-License-Identifier: MIT

/// @custom:authors: [@fnanni-0]
/// @custom:reviewers: []
/// @custom:auditors: []
/// @custom:bounties: []
/// @custom:deployments: []
/// @custom:tools: []

pragma solidity 0.8.18;

// TODO: standard interfaces should be placed in a separated repo (?)
import "../interfaces/IArbitratorV2.sol";

/// @title Implementation of the Evidence Standard for cross-chain submissions
contract EvidenceModule {
    IArbitratorV2 public arbitrator;

    event Evidence(
        IArbitratorV2 indexed _arbitrator,
        uint256 indexed _evidenceGroupID,
        address indexed _party,
        string _evidence
    );

    constructor(IArbitratorV2 _arbitrator) {
        arbitrator = _arbitrator;
    }

    /// @dev Submits evidence.
    /// @param _evidenceGroupID Unique identifier of the evidence group the evidence belongs to. It's the submitter responsability to submit the right evidence group ID.
    /// @param _evidence IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'.
    function submitEvidence(uint256 _evidenceGroupID, string calldata _evidence) external {
        emit Evidence(arbitrator, _evidenceGroupID, msg.sender, _evidence);
    }
}
