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
        uint256 blocknumber;
        bool sentSafe;
    }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IFastBridgeReceiver public fastBridgeReceiver; // The address of the Fast Bridge on Ethereum.
    uint256 public currentTicketID = 1; // Zero means not set, start at 1.
    mapping(uint256 => Ticket) public tickets; // The tickets by ticketID.

    /**
     * @dev Constructor.
     * @param _fastBridgeReceiver The address of the Fast Bridge on Ethereum.
     */
    constructor(
        IFastBridgeReceiver _fastBridgeReceiver
    ) SafeBridgeSenderToEthereum() {
        fastBridgeReceiver = _fastBridgeReceiver;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Sends an arbitrary message to Ethereum using the Fast Bridge.
     * @param _receiver The address of the contract on Ethereum which receives the calldata.
     * @param _calldata The receiving domain encoded message data.
     * @return ticketID The identifier to provide to sendSafeFallback().
     */
    function sendFast(address _receiver, bytes memory _calldata) external override returns (uint256 ticketID) {
        require(_calldata.length >= 4, "Malformed calldata: lacks function selector.");
        ticketID = currentTicketID++;

        (bytes32 messageHash, ) = _encode(
            ticketID, 
            block.number, 
            msg.sender, 
            _receiver, 
            _calldata);
        emit OutgoingMessage(ticketID, block.number, msg.sender, _receiver, messageHash, _calldata);

        tickets[ticketID] = Ticket({messageHash: messageHash, blocknumber: block.number, sentSafe: false});
    }


    /**
     * @dev Sends an arbitrary message to Ethereum using the Safe Bridge, which relies on Arbitrum's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _ticketID The ticketID as returned by `sendFast()`.
     * @param _fastMsgSender The msg.sender which called sendFast() to register this ticketID.
     * @param _receiver The address of the contract on Ethereum which receives the calldata.
     * @param _calldata The receiving domain encoded message data.
     */
    function sendSafeFallback(
        uint256 _ticketID,
        address _fastBridgeReceiver,
        address _fastMsgSender,
        address _receiver,
        bytes memory _calldata
    ) external payable override {
        // TODO: check if keeping _calldata in storage in sendFast() is cheaper than passing it again as a parameter here
        // However calldata gas cost-benefit analysis will change with EIP-4488.
        Ticket storage ticket = tickets[_ticketID];
        require(ticket.messageHash != 0, "Ticket does not exist.");
        require(ticket.sentSafe == false, "Ticket already sent safely.");

        (bytes32 messageHash, bytes memory messageData) = _encode(_ticketID, ticket.blocknumber, _fastMsgSender, _receiver, _calldata);
        require(ticket.messageHash == messageHash, "Invalid message for ticketID.");

        // Safe Bridge message envelope
        bytes4 methodSelector = IFastBridgeReceiver.verifyAndRelaySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(
            methodSelector,
            _ticketID,
            ticket.blocknumber,
            messageData
        );
        ticket.sentSafe = true;
        // TODO: how much ETH should be provided for bridging? add an ISafeBridgeSender.bridgingCost() if needed
        _sendSafe(address(_fastBridgeReceiver), safeMessageData);
    }

    // ************************ //
    // *       Internal       * //
    // ************************ //

    function _encode(
        uint256 _ticketID,
        uint256 _blocknumber,
        address _msgSender,
        address _receiver,
        bytes memory _calldata
    ) internal pure returns (bytes32 messageHash, bytes memory messageData) {
        // Encode the receiver address with the function signature + _msgSender as the first argument, then the rest of the args
        (bytes4 functionSelector, bytes memory _args) = abi.decode(_calldata, (bytes4, bytes));
        messageData = abi.encode(_receiver, abi.encodeWithSelector(functionSelector, _msgSender, _args));

        // Compute the hash over the message header (ticketID, blockNumber) and body (data).
        messageHash = keccak256(abi.encode(_ticketID, _blocknumber, messageData));
    }
}
