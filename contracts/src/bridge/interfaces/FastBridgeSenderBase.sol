// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./IFastBridgeSender.sol";
import "./ISafeBridgeSender.sol";
import "./IFastBridgeReceiver.sol";
import "../merkle/MerkleTree.sol";

/**
 * Fast Bridge Sender Base
 * Counterpart of `FastBridgeReceiverBase`
 */
abstract contract FastBridgeSenderBase is MerkleTree, IFastBridgeSender, ISafeBridgeSender {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public immutable genesis; // Marks the beginning of the genesis epoch (epoch 0).
    uint256 public immutable epochPeriod; // Epochs mark the period between potential batches of messages.
    mapping(uint256 => bytes32) public fastOutbox; // epoch count => merkle root of batched messages

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * The bridgers need to watch for these events and relay the
     * batchMerkleRoot on the FastBridgeReceiverOnEthereum.
     */
    event SendBatch(uint256 indexed epoch, bytes32 indexed batchMerkleRoot);

    /**
     * @dev Constructor.
     * @param _epochPeriod The duration between epochs.
     * @param _genesis The genesis time to synchronize epochs with the FastBridgeReceiverOnGnosis.
     */
    constructor(uint256 _epochPeriod, uint256 _genesis) {
        epochPeriod = _epochPeriod;
        genesis = _genesis;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Sends an arbitrary message to Ethereum using the Fast Bridge.
     * @param _receiver The address of the contract on Ethereum which receives the calldata.
     * @param _functionSelector The function to call.
     * @param _calldata The receiving domain encoded message data / function arguments.
     */
    function sendFast(
        address _receiver,
        bytes4 _functionSelector,
        bytes memory _calldata
    ) external override {
        bytes memory _fastMessage = abi.encodeWithSelector(_functionSelector, msg.sender, _calldata);
        bytes32 fastMessageHash = sha256(abi.encode(_fastMessage, batchSize));
        appendMessage(fastMessageHash); // add message to merkle tree
        emit MessageReceived(_receiver, _fastMessage, batchSize);
    }

    /**
     * Sends a batch of arbitrary message from one domain to another
     * via the fast bridge mechanism.
     */
    function sendEpoch() external {
        uint256 epochFinalized = (block.timestamp - genesis) / epochPeriod;
        require(fastOutbox[epochFinalized] == 0, "Batch already sent for most recent finalized epoch.");
        require(batchSize > 0, "No messages to send.");

        // set merkle root in outbox and reset merkle tree
        bytes32 batchMerkleRoot = getMerkleRootAndReset();
        fastOutbox[epochFinalized] = batchMerkleRoot;

        emit SendBatch(epochFinalized, batchMerkleRoot);
    }
}
