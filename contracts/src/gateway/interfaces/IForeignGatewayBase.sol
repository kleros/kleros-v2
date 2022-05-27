// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/interfaces/IFastBridgeReceiver.sol";

interface IForeignGatewayBase {
    /**
     * Receive the message from the home gateway.
     */
    function receiveMessage(address _messageSender) external;

    function fastBridgeReceiver() external view returns (address);

    function homeChainID() external view returns (uint256);

    function homeGateway() external view returns (address);
}
