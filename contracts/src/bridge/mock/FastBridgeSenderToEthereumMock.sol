// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shalzz, @hrishibhat, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../FastBridgeSenderToEthereum.sol";

/**
 * Fast Bridge Sender to Ethereum from Arbitrum
 * Counterpart of `FastBridgeReceiverOnEthereum`
 */
contract FastBridgeSenderToEthereumMock is FastBridgeSenderToEthereum {
    IArbSys public ARB_SYS_MOCK;

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //

    // struct Ticket {
    //     bytes32 messageHash;
    //     uint256 blockNumber;
    //     bool sentSafe;
    // }

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    // address public override governor; // The governor of the contract.
    // IFastBridgeReceiver public override fastBridgeReceiver; // The address of the Fast Bridge on Ethereum.
    // address public fastBridgeSender; // The address of the Fast Bridge sender on Arbitrum, generally the Home Gateway.
    // uint256 public currentTicketID = 1; // Zero means not set, start at 1.
    // mapping(uint256 => Ticket) public tickets; // The tickets by ticketID.

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    // modifier onlyByGovernor() {
    //     require(governor == msg.sender, "Access not allowed: Governor only.");
    //     _;
    // }

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
    ) FastBridgeSenderToEthereum(_governor, _fastBridgeReceiver, _fastBridgeSender) {}

    function set_arb(address _arbsys) external {
        // arbsys = IArbSys(address(_arbsys));
        ARB_SYS_MOCK = IArbSys(address(_arbsys));
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //
    function sendSafeFallbackMock(
        uint256 _ticketID,
        address _receiver,
        bytes memory _calldata
    ) external payable {
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
        _sendSafeMock(address(fastBridgeReceiver), safeMessageData);
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    // ************************ //
    // *       Internal       * //
    // ************************ //
    function _sendSafeMock(address _receiver, bytes memory _calldata) internal returns (uint256) {
        uint256 withdrawalId = ARB_SYS_MOCK.sendTxToL1(_receiver, _calldata);
        emit L2ToL1TxCreated(withdrawalId);
        return withdrawalId;
    }
}
