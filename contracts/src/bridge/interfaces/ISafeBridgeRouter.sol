// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ISafeBridgeReceiver.sol";

abstract contract ISafeBridgeRouter is ISafeBridgeReceiver {
    /**
     * Routes a message from one domain to another.
     * Note: Access restricted to the Safe Bridge.
     * @param _calldata The home chain encoded message data.
     * @return Unique id to track the message request/transaction.
     */
    function safeRelay(bytes memory _calldata) external virtual returns (bytes32);
}
