// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "../arbitration/IArbitrator.sol";

/// @title IEvidence
interface IEvidence {
    /// @dev To be raised when evidence is submitted. Should point to the resource (evidences are not to be stored on chain due to gas considerations).
    /// @param _evidenceGroupID Unique identifier of the evidence group the evidence belongs to.
    /// @param _party The address of the party submiting the evidence. Note that 0x0 refers to evidence not submitted by any party.
    /// @param _evidence IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'
    event Evidence(uint256 indexed _evidenceGroupID, address indexed _party, string _evidence);
}
