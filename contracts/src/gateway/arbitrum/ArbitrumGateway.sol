// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../arbitration/IArbitrator.sol";
import "../../bridge/IL2Bridge.sol";

import "../IHomeGateway.sol";
import "../IForeignGateway.sol";

import "../IHomeEvidence.sol";

contract ArbitrumGateway is IHomeGateway, IHomeEvidence {
    // L2 bridge with the ForeignGateway as the l1target
    IL2Bridge internal l2bridge;

    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => uint256) public disputeHashtoID;

    IForeignGateway public foreignGateway;
    IArbitrator public arbitrator;
    uint256 public chainID;

    modifier onlyFromL1() {
        l2bridge.onlyAuthorized(msg.sender);
        _;
    }

    constructor(
        IArbitrator _arbitrator,
        IL2Bridge _l2bridge,
        IForeignGateway _foreignGateway
    ) {
        arbitrator = _arbitrator;
        l2bridge = _l2bridge;
        foreignGateway = _foreignGateway;

        uint256 id;
        assembly {
            id := chainid()
        }
        chainID = id;

        emit MetaEvidence(0, "BRIDGE");
    }

    function rule(uint256 _disputeID, uint256 _ruling) external {
        require(msg.sender == address(arbitrator), "Only Arbitrator");

        bytes4 methodSelector = IForeignGateway.relayRule.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, disputeIDtoHash[_disputeID], _ruling);

        l2bridge.sendCrossDomainMessage(data);
    }

    /**
     * Relay the createDispute call from the foreign gateway to the arbitrator.
     */
    function relayCreateDispute(
        bytes32 _disputeHash,
        uint256 _choices,
        bytes calldata _extraData
    ) external onlyFromL1 {
        uint256 disputeID = arbitrator.createDispute(_choices, _extraData);
        disputeIDtoHash[disputeID] = _disputeHash;
        disputeHashtoID[_disputeHash] = disputeID;

        emit Dispute(arbitrator, disputeID, 0, 0);
    }

    function homeDisputeHashToID(bytes32 _disputeHash) external view returns (uint256) {
        return disputeHashtoID[_disputeHash];
    }

    function homeToForeignDisputeID(uint256 _homeDisputeID) external view returns (uint256) {
        bytes32 disputeHash = disputeIDtoHash[_homeDisputeID];
        require(disputeHash != 0, "Dispute does not exist");

        return foreignGateway.foreignDisputeHashToID(disputeHash);
    }

    function foreignChainID(uint256 _homeDisputeID) external view returns (uint256) {
        return foreignGateway.chainID();
    }

    function foreignBridge(uint256 _homeDisputeID) external view returns (address) {
        return address(foreignGateway);
    }
}
