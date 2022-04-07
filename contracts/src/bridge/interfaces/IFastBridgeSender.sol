// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IFastBridgeSender {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * @dev The Fast Bridge participants need to watch for these events and relay the messageHash on the FastBridgeReceiverOnEthereum.
     * @param ticketID The ticket identifier referring to a message going through the bridge.
     * @param blockNumber The block number when the message with this ticketID has been created.
     * @param target The address of the cross-domain receiver of the message, generally the Foreign Gateway.
     * @param messageHash The hash uniquely identifying this message.
     * @param message The message data.
     */
    event OutgoingMessage(
        uint256 indexed ticketID,
        uint256 blockNumber,
        address target,
        bytes32 indexed messageHash,
        bytes message
    );

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    /**
     * Note: Access must be restricted to the sending application.
     * @dev Sends an arbitrary message across domain using the Fast Bridge.
     * @param _receiver The cross-domain contract address which receives the calldata.
     * @param _calldata The receiving domain encoded message data.
     * @return ticketID The identifier to provide to sendSafeFallback().
     */
    function sendFast(address _receiver, bytes memory _calldata) external returns (uint256 ticketID);

    /**
     * @dev Sends an arbitrary message across domain using the Safe Bridge, which relies on the chain's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _ticketID The ticketID as returned by `sendFast()`.
     * @param _receiver The cross-domain contract address which receives the calldata.
     * @param _calldata The receiving domain encoded message data.
     */
    function sendSafeFallback(
        uint256 _ticketID,
        address _receiver,
        bytes memory _calldata
    ) external payable;
}
