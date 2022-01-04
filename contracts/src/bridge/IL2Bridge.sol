// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IL2Bridge {
    /**
     * Sends an arbitrary message from one domain to another.
     *
     * @param _calldata The L1 encoded message data.
     * @return Unique id to track the message request/transaction.
     */
    function sendCrossDomainMessage(bytes memory _calldata) external returns (uint256);

    function onlyAuthorized(address _sender) external;
}
