// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shalzz, @jaybuidl]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../arbitration/IArbitrator.sol";
import "../bridge/interfaces/IFastBridgeSender.sol";

import "./interfaces/IForeignGateway.sol";
import "./interfaces/IHomeGateway.sol";

/**
 * Home Gateway
 * Counterpart of `ForeignGateway`
 */
contract HomeGateway is IHomeGateway {
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => uint256) public disputeHashtoID;

    address public governor;
    IArbitrator public immutable arbitrator;
    IFastBridgeSender public fastbridge;
    address public override foreignGateway;
    uint256 public immutable override chainID;
    uint256 public immutable override foreignChainID;

    struct RelayedData {
        uint256 arbitrationCost;
        address relayer;
    }
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    constructor(
        address _governor,
        IArbitrator _arbitrator,
        IFastBridgeSender _fastbridge,
        address _foreignGateway,
        uint256 _foreignChainID
    ) {
        governor = _governor;
        arbitrator = _arbitrator;
        fastbridge = _fastbridge;
        foreignGateway = _foreignGateway;
        foreignChainID = _foreignChainID;
        uint256 id;
        assembly {
            id := chainid()
        }
        chainID = id;

        emit MetaEvidence(0, "BRIDGE");
    }

    /**
     * @dev Provide the same parameters as on the originalChain while creating a
     *      dispute. Providing incorrect parameters will create a different hash
     *      than on the originalChain and will not affect the actual dispute/arbitrable's
     *      ruling.
     *
     * @param _originalChainID originalChainId
     * @param _originalBlockHash originalBlockHash
     * @param _originalDisputeID originalDisputeID
     * @param _choices number of ruling choices
     * @param _extraData extraData
     * @param _arbitrable arbitrable
     */
    function relayCreateDispute(
        uint256 _originalChainID,
        bytes32 _originalBlockHash,
        uint256 _originalDisputeID,
        uint256 _choices,
        bytes calldata _extraData,
        address _arbitrable
    ) external payable override {
        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                _originalChainID,
                _originalBlockHash,
                "createDispute",
                _originalDisputeID,
                _choices,
                _extraData,
                _arbitrable
            )
        );
        RelayedData storage relayedData = disputeHashtoRelayedData[disputeHash];
        require(relayedData.relayer == address(0), "Dispute already relayed");

        // TODO: will mostly be replaced by the actual arbitrationCost paid on the foreignChain.
        relayedData.arbitrationCost = arbitrator.arbitrationCost(_extraData);
        require(msg.value >= relayedData.arbitrationCost, "Not enough arbitration cost paid");

        uint256 disputeID = arbitrator.createDispute{value: msg.value}(_choices, _extraData);
        disputeIDtoHash[disputeID] = disputeHash;
        disputeHashtoID[disputeHash] = disputeID;
        relayedData.relayer = msg.sender;

        emit Dispute(arbitrator, disputeID, 0, 0);
    }

    function rule(uint256 _disputeID, uint256 _ruling) external override {
        require(msg.sender == address(arbitrator), "Only Arbitrator");

        bytes32 disputeHash = disputeIDtoHash[_disputeID];
        RelayedData memory relayedData = disputeHashtoRelayedData[disputeHash];

        bytes4 methodSelector = IForeignGateway.relayRule.selector;
        bytes memory data = abi.encode(disputeHash, _ruling, relayedData.relayer);

        fastbridge.sendFast(foreignGateway, methodSelector, data);
    }

    /** @dev Changes the fastBridge, useful to increase the claim deposit.
     *  @param _fastbridge The address of the new fastBridge.
     */
    function changeFastbridge(IFastBridgeSender _fastbridge) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        fastbridge = _fastbridge;
    }

    function disputeHashToHomeID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoID[_disputeHash];
    }
}
