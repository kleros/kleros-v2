// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFastBridgeSender {
    /**
     * Sends an arbitrary message from one domain to another
     * via the fast bridge mechanism
     *
     * @param _receiver The L1 contract address who will receive the calldata
     * @param _calldata The receiving domain encoded message data.
     */
    function sendFast(address _receiver, bytes memory _calldata) external returns (uint256 ticketID);

    /**
     * Sends an arbitrary message from one domain to another
     * via the fast bridge mechanism
     *
     * @param _receiver The L1 contract address who will receive the calldata
     * @param _calldata The receiving domain encoded message data.
     */
    function sendSafeFallback(
        uint256 _ticketID,
        address _receiver,
        bytes memory _calldata
    ) external payable;
}
