/**
 * @authors: [@fnanni-0]
 * @reviewers: []
 * @auditors: []
 * @bounties: []
 * @deployments: []
 * SPDX-License-Identifier: MIT
 */
pragma solidity ^0.8;

import "@kleros/erc-792/contracts/IArbitrator.sol";

/** @title IForeignEvidence
 *  ERC-1497: Evidence Standard
 */
interface IForeignEvidence {
    /**
     * @dev To be raised when evidence is submitted. Should point to the resource (evidences are not to be stored on chain due to gas considerations).
     * @param _disputeID ID of the dispute in the Arbitrator contract.
     * @param _party The address of the party submiting the evidence. Note that 0x0 refers to evidence not submitted by any party.
     * @param _evidence IPFS path to evidence, example: '/ipfs/Qmarwkf7C9RuzDEJNnarT3WZ7kem5bk8DZAzx78acJjMFH/evidence.json'
     */
    event ForeignEvidence(uint256 indexed _disputeID, address indexed _party, string _evidence);
}
