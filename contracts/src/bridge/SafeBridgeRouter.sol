// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/ISafeBridgeReceiver.sol";
import "./interfaces/ISafeBridgeSender.sol";
import "./interfaces/gnosis-chain/IAMB.sol";
import "./interfaces/arbitrum/IInbox.sol";
import "./interfaces/arbitrum/IOutbox.sol";

/**
 * Router on Ethereum from Arbitrum to Gnosis Chain.
 */
contract SafeBridgeRouter is ISafeBridgeReceiver, ISafeBridgeSender {
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
     * @param _epoch The epoch associated with the _batchmerkleRoot.
     * @param _batchMerkleRoot The true batch merkle root for the epoch sent by the safe bridge.     * @return Unique id to track the message request/transaction.
     */
    function verifySafe(uint256 _epoch, bytes32 _batchMerkleRoot) external override onlyFromSafeBridge {
        require(isSentBySafeBridge(), "Access not allowed: SafeBridgeSender only.");

        bytes4 methodSelector = ISafeBridgeReceiver.verifySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _epoch, _batchMerkleRoot);

        // replace maxGasPerTx with safe level for production deployment
        bytes32 txID = _sendSafe(fastBridgeReceiverOnGnosisChain, safeMessageData);
        emit safeRelayed(txID);
    }

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (bytes32) {
        return amb.requireToPassMessage(_receiver, _calldata, amb.maxGasPerTx());
    }

    // ************************************* //
    // *              Views                * //
    // ************************************* //

    function isSentBySafeBridge() internal view override returns (bool) {
        IOutbox outbox = IOutbox(inbox.bridge().activeOutbox());
        return outbox.l2ToL1Sender() == safeBridgeSender;
    }
}
