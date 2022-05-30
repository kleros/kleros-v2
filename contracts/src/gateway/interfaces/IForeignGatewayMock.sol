// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IForeignGatewayBase.sol";

interface IForeignGatewayMock is IForeignGatewayBase {
    /**
     * Receive the message from the home gateway.
     */
    function receiveMessage(address _messageSender) external;
}
