// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere, @shalzz]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../arbitration/IArbitrator.sol";
import "@kleros/vea-contracts/interfaces/IFastBridgeSender.sol";
import "./interfaces/IForeignGateway.sol";
import "./interfaces/IHomeGateway.sol";

/**
 * Home Gateway
 * Counterpart of `ForeignGateway`
 */
contract HomeGateway is IHomeGateway {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct RelayedData {
        uint256 arbitrationCost;
        address relayer;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor;
    IArbitrator public immutable arbitrator;
    IFastBridgeSender public fastBridgeSender;
    address public override receiverGateway;
    uint256 public immutable override receiverChainID;
    mapping(uint256 => bytes32) public disputeIDtoHash;
    mapping(bytes32 => uint256) public disputeHashtoID;
    mapping(bytes32 => RelayedData) public disputeHashtoRelayedData;

    constructor(
        address _governor,
        IArbitrator _arbitrator,
        IFastBridgeSender _fastBridgeSender,
        address _receiverGateway,
        uint256 _receiverChainID
    ) {
        governor = _governor;
        arbitrator = _arbitrator;
        fastBridgeSender = _fastBridgeSender;
        receiverGateway = _receiverGateway;
        receiverChainID = _receiverChainID;

        emit MetaEvidence(0, "BRIDGE");
    }

    // ************************************* //
    // *           Governance              * //
    // ************************************* //

    /**
     * @dev Changes the fastBridge, useful to increase the claim deposit.
     * @param _fastBridgeSender The address of the new fastBridge.
     */
    function changeFastbridge(IFastBridgeSender _fastBridgeSender) external {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        fastBridgeSender = _fastBridgeSender;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

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
    ) external payable override {
        bytes32 disputeHash = keccak256(
            abi.encodePacked(
                _foreignChainID,
                _foreignBlockHash,
                "createDispute",
                _foreignDisputeID,
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

    /**
     * @dev Give a ruling for a dispute. Must be called by the arbitrator.
     *      The purpose of this function is to ensure that the address calling it has the right to rule on the contract.
     * @param _disputeID ID of the dispute in the Arbitrator contract.
     * @param _ruling Ruling given by the arbitrator. Note that 0 is reserved for "Not able/wanting to make a decision".
     */
    function rule(uint256 _disputeID, uint256 _ruling) external override {
        require(msg.sender == address(arbitrator), "Only Arbitrator");

        bytes32 disputeHash = disputeIDtoHash[_disputeID];
        RelayedData memory relayedData = disputeHashtoRelayedData[disputeHash];

        bytes4 methodSelector = IForeignGateway.relayRule.selector;
        bytes memory data = abi.encodeWithSelector(methodSelector, disputeHash, _ruling, relayedData.relayer);

        fastBridgeSender.sendFast(receiverGateway, data);
    }

    /**
     * @dev Looks up the local home disputeID for a disputeHash. For cross-chain Evidence standard.
     * @param _disputeHash dispute hash
     */
    function disputeHashToHomeID(bytes32 _disputeHash) external view override returns (uint256) {
        return disputeHashtoID[_disputeHash];
    }
}
