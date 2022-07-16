// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./SafeBridgeSenderToEthereum.sol";
import "./interfaces/IFastBridgeSender.sol";
import "./interfaces/IFastBridgeReceiver.sol";

/**
 * Fast Bridge Sender to Ethereum from Arbitrum
 * Counterpart of `FastBridgeReceiverOnEthereum`
 */
contract FastBridgeSenderToEthereum is SafeBridgeSenderToEthereum, IFastBridgeSender {
    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    struct Ticket {
        bytes32 messageHash;
        uint256 blockNumber;
        bool sentSafe;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    address public governor; // The governor of the contract.
    IFastBridgeReceiver public fastBridgeReceiver; // The address of the Fast Bridge on Ethereum.
    address public fastBridgeSender; // The address of the Fast Bridge sender on Arbitrum, generally the Home Gateway.
    uint256 public currentTicketID = 1; // Zero means not set, start at 1.
    mapping(uint256 => Ticket) public tickets; // The tickets by ticketID.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    /**
     * @dev Constructor.
     * @param _governor The governor's address.
     * @param _fastBridgeReceiver The address of the Fast Bridge on Ethereum.
     * @param _fastBridgeSender The address of the Fast Bridge sender on Arbitrum, generally the Home Gateway.
     */
    constructor(
        address _governor,
        IFastBridgeReceiver _fastBridgeReceiver,
        address _fastBridgeSender
    ) SafeBridgeSenderToEthereum() {
        governor = _governor;
        fastBridgeReceiver = _fastBridgeReceiver;
        fastBridgeSender = _fastBridgeSender;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * Note: Access restricted to the `fastSender`, generally the Gateway.
     * @dev Sends an arbitrary message to Ethereum using the Fast Bridge.
     * @param _receiver The address of the contract on Ethereum which receives the calldata.
     * @param _calldata The receiving domain encoded message data.
     * @return ticketID The identifier to provide to sendSafeFallback().
     */
    function sendFast(address _receiver, bytes memory _calldata) external override returns (uint256 ticketID) {
        require(msg.sender == fastBridgeSender, "Access not allowed: Fast Sender only.");

        ticketID = currentTicketID++;

        (bytes32 messageHash, bytes memory messageData) = _encode(ticketID, block.number, _receiver, _calldata);
        emit OutgoingMessage(ticketID, block.number, _receiver, messageHash, messageData);

        tickets[ticketID] = Ticket({messageHash: messageHash, blockNumber: block.number, sentSafe: false});
    }

    /**
     * @dev Sends an arbitrary message to Ethereum using the Safe Bridge, which relies on Arbitrum's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _ticketID The ticketID as returned by `sendFast()`.
     * @param _receiver The address of the contract on Ethereum which receives the calldata.
     * @param _calldata The receiving domain encoded message data.
     */
    function sendSafeFallback(
        uint256 _ticketID,
        address _receiver,
        bytes memory _calldata
    ) external payable override {
        // TODO: check if keeping _calldata in storage in sendFast() is cheaper than passing it again as a parameter here
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.messageHash != 0, "Ticket does not exist.");
        require(ticket.sentSafe == false, "Ticket already sent safely.");

        (bytes32 messageHash, bytes memory messageData) = _encode(_ticketID, ticket.blockNumber, _receiver, _calldata);
        require(ticket.messageHash == messageHash, "Invalid message for ticketID.");

        // Safe Bridge message envelope
        bytes4 methodSelector = IFastBridgeReceiver.verifyAndRelaySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(
            methodSelector,
            _ticketID,
            ticket.blockNumber,
            messageData
        );

        // TODO: how much ETH should be provided for bridging? add an ISafeBridgeSender.bridgingCost() if needed
        _sendSafe(address(fastBridgeReceiver), safeMessageData);
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    function changeFastSender(address _fastBridgeSender) external onlyByGovernor {
        fastBridgeSender = _fastBridgeSender;
    }

    // ************************ //
    // *       Internal       * //
    // ************************ //

    function _encode(
        uint256 _ticketID,
        uint256 _blockNumber,
        address _receiver,
        bytes memory _calldata
    ) internal pure returns (bytes32 messageHash, bytes memory messageData) {
        // Encode the receiver address with the function signature + arguments i.e calldata
        messageData = abi.encode(_receiver, _calldata);

        // Compute the hash over the message header (ticketID, blockNumber) and body (data).
        messageHash = keccak256(abi.encode(_ticketID, _blockNumber, messageData));
    }
}
