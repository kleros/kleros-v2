// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ISafeBridge {
    /**
     * Sends an arbitrary message from one domain to another.
     *
     * @param _receiver The L1 contract address who will receive the calldata
     * @param _calldata The L2 encoded message data.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(address _receiver, bytes memory _calldata) external virtual returns (uint256);
}
