// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../interfaces/IForeignGatewayBase.sol";

/**
 * Foreign Gateway Mock
 * Counterpart of `HomeGatewayMock`
 */
contract ForeignGatewayMock is IForeignGatewayBase {
    address public immutable fastBridgeReceiver;
    address public immutable override homeGateway;
    uint256 public immutable override homeChainID;

    uint256 public messageCount;
    uint256 public data;

    constructor(
        address _fastBridgeReceiver,
        address _homeGateway,
        uint256 _homeChainID
    ) {
        fastBridgeReceiver = _fastBridgeReceiver;
        homeGateway = _homeGateway;
        homeChainID = _homeChainID;
    }

    modifier onlyFromFastBridge() {
        require(address(fastBridgeReceiver) == msg.sender, "Fast Bridge only.");
        _;
    }

    /**
     * Receive the message from the home gateway.
     */
    function receiveMessage(address _messageSender) external onlyFromFastBridge {
        require(_messageSender == homeGateway, "Only the homegateway is allowed.");
        _receiveMessage();
    }

    /**
     * Receive the message from the home gateway.
     */
    function receiveMessage(address _messageSender, uint256 _data) external onlyFromFastBridge {
        require(_messageSender == homeGateway, "Only the homegateway is allowed.");
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
