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
    IFastBridgeReceiver public immutable fastbridge;
    address public immutable override homeGateway;
    uint256 public immutable override homeChainID;
    uint256 public immutable override chainID;

    uint256 public messageCount;
    uint256 public data;

    constructor(
        IFastBridgeReceiver _fastbridge,
        address _homeGateway,
        uint256 _homeChainID
    ) {
        fastbridge = _fastbridge;
        homeGateway = _homeGateway;
        homeChainID = _homeChainID;
        uint256 id;
        assembly {
            id := chainid()
        }
        chainID = id;
    }

    modifier onlyFromFastBridge() {
        require(address(fastbridge) == msg.sender, "Fast Bridge only.");
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
