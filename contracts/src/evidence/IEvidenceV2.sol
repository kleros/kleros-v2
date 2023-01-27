// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../arbitration/IArbitratorV2.sol";

/** @title IEvidence
 *  ERC-1497: Evidence Standard
 */
interface IEvidenceV2 {
    /**
     * @dev To be raised when evidence is submitted. Should point to the resource (evidences are not to be stored on chain due to gas considerations).
     * @param _arbitrator The arbitrator of the contract.
     * @param _externalDisputeID Unique identifier from the dispute creator that is linked to this dispute.
     * @param _party The address of the party submiting the evidence. Note that 0x0 refers to evidence not submitted by any party.
     * @param _evidenceUri IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'
     */
    event Evidence(
        IArbitratorV2 indexed _arbitrator,
        uint256 indexed _externalDisputeID,
        address indexed _party,
        string _evidenceUri
    );
}
