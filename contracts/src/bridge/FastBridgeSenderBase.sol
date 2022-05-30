// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./merkle/MerkleTree.sol";
import "./interfaces/IFastBridgeSender.sol";
import "./interfaces/ISafeBridgeSender.sol";
import "./interfaces/ISafeBridgeReceiver.sol";

/**
 * Fast Bridge Sender Base
 * Counterpart of `FastReceiverBase`
 */
abstract contract FastBridgeSenderBase is MerkleTree, IFastBridgeSender, ISafeBridgeSender {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public immutable epochPeriod; // Epochs mark the period between potential batches of messages.
    uint256 public currentBatchID;
    mapping(uint256 => bytes32) public fastOutbox; // epoch count => merkle root of batched messages
    address public immutable safeRouter;

    // ************************************* //
    // *              Events               * //
    // ************************************* //

    /**
     * The bridgers need to watch for these events and relay the
     * batchMerkleRoot on the FastBridgeReceiver.
     */
    event SendBatch(uint256 indexed currentBatchID, bytes32 indexed batchMerkleRoot);

    /**
     * @dev Constructor.
     * @param _epochPeriod The duration between epochs.
     * @param _safeRouter The the Safe Bridge Router on Ethereum to the foreign chain.
     */
    constructor(uint256 _epochPeriod, address _safeRouter) {
        epochPeriod = _epochPeriod;
        safeRouter = _safeRouter;
        currentBatchID = block.timestamp / epochPeriod;
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
        bytes memory _fastMessageCalldata = abi.encodeWithSelector(_functionSelector, msg.sender, _calldata);
        bytes memory _fastMessage = abi.encode(_receiver, _fastMessageCalldata);
        bytes32 fastMessageHash = sha256(abi.encode(_fastMessage, batchSize));

        appendMessage(fastMessageHash); // add message to merkle tree

        emit MessageReceived(currentBatchID, fastMessageHash, batchSize);
    }

    /**
     * @dev Sends an arbitrary message to Ethereum using the Fast Bridge.
     * @param _receiver The address of the contract on Ethereum which receives the calldata.
     * @param _functionSelector The function to call.
     */
    function sendFast(address _receiver, bytes4 _functionSelector) external override {
        bytes memory _fastMessageCalldata = abi.encodeWithSelector(_functionSelector, msg.sender);
        bytes memory _fastMessage = abi.encode(_receiver, _fastMessageCalldata);
        bytes32 fastMessageHash = sha256(abi.encode(_fastMessage, batchSize));

        appendMessage(fastMessageHash); // add message to merkle tree

        emit MessageReceived(currentBatchID, fastMessageHash, batchSize);
    }

    /**
     * Sends a batch of arbitrary message from one domain to another
     * via the fast bridge mechanism.
     */
    function sendEpoch() external {
        uint256 epoch = block.timestamp / epochPeriod;
        require(fastOutbox[epoch] == 0, "Batch already sent for the current epoch.");
        require(batchSize > 0, "No messages to send.");

        // set merkle root in outbox and reset merkle tree
        bytes32 batchMerkleRoot = getMerkleRootAndReset();
        fastOutbox[epoch] = batchMerkleRoot;

        emit SendBatch(currentBatchID, batchMerkleRoot);

        currentBatchID = epoch;
    }
}
