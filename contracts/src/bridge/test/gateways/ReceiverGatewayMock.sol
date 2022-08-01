// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./IReceiverGatewayMock.sol";

/**
 * Receiver Gateway Mock
 * Counterpart of `SenderGatewayMock`
 */
contract ReceiverGatewayMock is IReceiverGateway {
    IFastBridgeReceiver public immutable fastBridgeReceiver;
    address public immutable override senderGateway;
    uint256 public immutable override senderChainID;

    uint256 public messageCount;
    uint256 public data;

    constructor(
        IFastBridgeReceiver _fastBridgeReceiver,
        address _senderGateway,
        uint256 _senderChainID
    ) {
        fastBridgeReceiver = _fastBridgeReceiver;
        senderGateway = _senderGateway;
        senderChainID = _senderChainID;
    }

    modifier onlyFromFastBridge() {
        require(address(fastBridgeReceiver) == msg.sender, "Fast Bridge only.");
        _;
    }

    /**
     * Receive the message from the sender gateway.
     */
    function receiveMessage(address _messageSender) external onlyFromFastBridge {
        require(_messageSender == senderGateway, "Only the sender gateway is allowed.");
        _receiveMessage();
    }

    /**
     * Receive the message from the sender gateway.
     */
    function receiveMessage(address _messageSender, uint256 _data) external onlyFromFastBridge {
        require(_messageSender == senderGateway, "Only the sender gateway is allowed.");
        _receiveMessage(_data);
    }

    function _receiveMessage() internal {
        messageCount++;
    }

    function _receiveMessage(uint256 _data) internal {
        messageCount++;
        data = _data;
    }
}
