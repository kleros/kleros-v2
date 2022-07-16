// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./IForeignGatewayBase.sol";

interface IForeignGatewayMock is IForeignGatewayBase {
    /**
     * Receive the message from the home gateway.
     */
    function receiveMessage(address _messageSender) external;
}
