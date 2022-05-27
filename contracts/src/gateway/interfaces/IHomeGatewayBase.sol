// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../bridge/interfaces/IFastBridgeSender.sol";

interface IHomeGatewayBase {
    /**
     * Send fast message to foreign gateway.
     */
    function sendFastMessage() external;

    function fastBridgeSender() external view returns (IFastBridgeSender);

    function foreignChainID() external view returns (uint256);

    function foreignGateway() external view returns (address);
}
