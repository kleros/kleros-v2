// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../arbitration/IArbitrator.sol";
import "../bridge/IL2Bridge.sol";

import "./interfaces/IHomeGateway.sol";
import "./interfaces/IForeignGateway.sol";

abstract contract BaseHomeGateway is IL2Bridge, IHomeGateway {
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => uint256) public disputeHashtoID;

    IForeignGateway public foreignGateway;
    IArbitrator public arbitrator;
    uint256 public chainID;

    struct RelayedData {
        uint256 choices;
        bytes extraData;
        uint256 numOfJurors;
        address forwarder;
    }
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    modifier onlyFromL1() {
        onlyAuthorized();
        _;
    }

    constructor(IArbitrator _arbitrator, IForeignGateway _foreignGateway) {
        arbitrator = _arbitrator;
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

        bytes32 disputeHash = disputeIDtoHash[_disputeID];
        RelayedData memory relayedData = disputeHashtoRelayedData[disputeHash];

        bytes4 methodSelector = IForeignGateway.relayRule.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, disputeHash, _ruling, relayedData.forwarder);

        sendCrossDomainMessage(data);
    }

    /**
     * Relay the createDispute call from the foreign gateway to the arbitrator.
     */
    function relayCreateDispute(
        bytes32 _disputeHash,
        uint256 _choices,
        bytes calldata _extraData,
        uint256 _numOfJurors
    ) external onlyFromL1 {
        RelayedData storage relayedData = disputeHashtoRelayedData[_disputeHash];
        relayedData.choices = _choices;
        relayedData.extraData = _extraData;
        relayedData.numOfJurors = _numOfJurors;
    }

    function forwardCreateDispute(bytes32 _disputeHash) external payable {
        RelayedData storage relayedData = disputeHashtoRelayedData[_disputeHash];

        // TODO: Account for numOfJurors instead of just minJurors
        uint256 cost = arbitrator.arbitrationCost(relayedData.extraData);
        require(msg.value >= cost, "Not enough arbitration cost paid");

        uint256 disputeID = arbitrator.createDispute{value: cost}(relayedData.choices, relayedData.extraData);
        disputeIDtoHash[disputeID] = _disputeHash;
        disputeHashtoID[_disputeHash] = disputeID;
        relayedData.forwarder = msg.sender;

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
