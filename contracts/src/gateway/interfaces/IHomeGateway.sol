// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere, @shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrable.sol";
import "../../evidence/IMetaEvidence.sol";
import "@kleros/vea-contracts/interfaces/ISenderGateway.sol";

interface IHomeGateway is IArbitrable, IMetaEvidence, ISenderGateway {
    /**
     * @dev Provide the same parameters as on the foreignChain while creating a dispute. Providing incorrect parameters will create a different hash than on the foreignChain and will not affect the actual dispute/arbitrable's ruling.
     * @param _foreignChainID foreignChainId
     * @param _foreignBlockHash foreignBlockHash
     * @param _foreignDisputeID foreignDisputeID
     * @param _choices number of ruling choices
     * @param _extraData extraData
     * @param _arbitrable arbitrable
     */
    function relayCreateDispute(
        uint256 _foreignChainID,
        bytes32 _foreignBlockHash,
        uint256 _foreignDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        address _arbitrable
    ) external payable;

    /**
     * @dev Looks up the local home disputeID for a disputeHash. For cross-chain Evidence standard.
     * @param _disputeHash dispute hash
     */
    function disputeHashToHomeID(bytes32 _disputeHash) external view returns (uint256);
}
