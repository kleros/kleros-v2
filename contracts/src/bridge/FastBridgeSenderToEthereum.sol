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
    // *             Storage               * //
    // ************************************* //

    address public governor;
    IFastBridgeReceiver public fastBridgeReceiver;
    address public fastSender;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * The bridgers need to watch for these events and
     * relay the messageHash on the FastBridgeReceiverOnEthereum.
     */
    event OutgoingMessage(address indexed target, bytes32 indexed messageHash, bytes message);

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //

    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(address _governor, IFastBridgeReceiver _fastBridgeReceiver) SafeBridgeSenderToEthereum() {
        governor = _governor;
        fastBridgeReceiver = _fastBridgeReceiver;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * Sends an arbitrary message from one domain to another
     * via the fast bridge mechanism
     *
     * @param _receiver The L1 contract address who will receive the calldata
     * @param _calldata The receiving domain encoded message data.
     */
    function sendFast(address _receiver, bytes memory _calldata) external override {
        require(msg.sender == fastSender, "Access not allowed: Fast Sender only.");

        // Encode the receiver address with the function signature + arguments i.e calldata
        bytes memory messageData = abi.encode(_receiver, _calldata);

        emit OutgoingMessage(_receiver, keccak256(messageData), messageData);
    }

    /**
     * Sends an arbitrary message from one domain to another
     * via the safe bridge mechanism, which relies on the chain's native bridge.
     *
     * It is unnecessary during normal operations but essential only in case of challenge.
     *
     * It may require some ETH (or whichever native token) to pay for the bridging cost,
     * depending on the underlying safe bridge.
     *
     * @param _receiver The L1 contract address who will receive the calldata
     * @param _calldata The receiving domain encoded message data.
     */
    function sendSafeFallback(address _receiver, bytes memory _calldata) external payable override {
        bytes memory messageData = abi.encode(_receiver, _calldata);

        // Safe Bridge message envelope
        bytes4 methodSelector = IFastBridgeReceiver.verifyAndRelaySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, keccak256(messageData), messageData);

        // TODO: how much ETH should be provided for bridging? add an ISafeBridgeSender.bridgingCost() if needed
        _sendSafe(address(fastBridgeReceiver), safeMessageData);
    }

    // ************************ //
    // *      Governance      * //
    // ************************ //

    function setFastSender(address _fastSender) external onlyByGovernor {
        require(fastSender == address(0));
        fastSender = _fastSender;
    }
}
