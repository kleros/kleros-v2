// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/ISafeBridgeRouter.sol";
import "./interfaces/gnosis-chain/IAMB.sol";
import "./interfaces/arbitrum/IInbox.sol";
import "./interfaces/arbitrum/IOutbox.sol";

/**
 * Router on Ethereum from Arbitrum to Gnosis Chain.
 */
contract SafeBridgeRouter is ISafeBridgeRouter {
    // ************************************* //
    // *              Events               * //
    // ************************************* //

    event safeRelayed(bytes32 indexed txID);

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IInbox public immutable inbox; // The address of the Arbitrum Inbox contract.
    IAMB public immutable amb; // The address of the AMB contract on Ethereum.
    address public immutable safeBridgeSender; // The address of the Safe Bridge sender on Arbitrum.
    address public immutable fastBridgeReceiverOnGnosisChain; // The address of the Fast Bridge Receiver on Gnosis Chain.

    /**
     * @dev Constructor.
     * @param _inbox The address of the inbox contract on Ethereum.
     * @param _amb The duration of the period allowing to challenge a claim.
     * @param _safeBridgeSender The safe bridge sender on Arbitrum.
     * @param _fastBridgeReceiverOnGnosisChain The fast bridge receiver on Gnosis Chain.
     */
    constructor(
        IInbox _inbox,
        IAMB _amb,
        address _safeBridgeSender,
        address _fastBridgeReceiverOnGnosisChain
    ) {
        inbox = _inbox;
        amb = _amb;
        safeBridgeSender = _safeBridgeSender;
        fastBridgeReceiverOnGnosisChain = _fastBridgeReceiverOnGnosisChain;
    }

    /**
     * Routes an arbitrary message from one domain to another.
     * Note: Access restricted to the Safe Bridge.
     * @param _calldata The home chain encoded message data including function selector.
     * @return Unique id to track the message request/transaction.
     */
    function safeRelay(bytes memory _calldata) external override returns (bytes32) {
        require(isSentBySafeBridge(), "Access not allowed: SafeBridgeSender only.");

        // replace maxGasPerTx with safe level for production deployment
        bytes32 txID = amb.requireToPassMessage(fastBridgeReceiverOnGnosisChain, _calldata, amb.maxGasPerTx());
        emit safeRelayed(txID);
        return txID;
    }

    // ************************************* //
    // *              Views                * //
    // ************************************* //

    function isSentBySafeBridge() internal view override returns (bool) {
        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        return outbox.l2ToL1Sender() == safeBridgeSender;
    }
}
