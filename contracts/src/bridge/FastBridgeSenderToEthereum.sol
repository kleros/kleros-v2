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

    IFastBridgeReceiver public immutable fastBridgeReceiver; // The address of the Fast Bridge on Ethereum.

    uint256 public immutable genesis; // Marks the beginning of the first epoch.
    uint256 public immutable epochPeriod; // Epochs mark the period between potential batches of messages.

    bytes32[64] public batch; // merkle tree, supports 2^64 outbound messages
    uint256 public batchSize; // merkle tree leaf count
    mapping(uint256 => bytes32) public fastOutbox; // epoch => merkle root of batched messages

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
     * @param _fastBridgeReceiver The address of the Fast Bridge on Ethereum.
     * @param _genesis The immutable genesis state variable from the FastBridgeSeneder.
     */
    constructor(
        IFastBridgeReceiver _fastBridgeReceiver,
        uint256 _epochPeriod,
        uint256 _genesis
    ) SafeBridgeSenderToEthereum() {
        fastBridgeReceiver = _fastBridgeReceiver;
        genesis = _genesis;
        epochPeriod = _epochPeriod;
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Sends an arbitrary message to Ethereum using the Fast Bridge.
     * @param _receiver The address of the contract on Ethereum which receives the calldata.
     * @param _calldata The receiving domain encoded message data.
     */
    function sendFast(address _receiver, bytes memory _calldata) external override {
        bytes32 messageHash = _encode(_receiver, _calldata);
        insertInBatch(messageHash);
        emit MessageReceived(_receiver, _calldata, batchSize);
    }

    /**
     * Sends a batch of arbitrary message from one domain to another
     * via the fast bridge mechanism.
     */
    function sendBatch() public {
        uint256 epochFinalized = (block.timestamp - genesis) / epochPeriod;
        require(fastOutbox[epochFinalized] == 0, "Batch already sent for most recent finalized epoch.");
        require(batchSize > 0, "No messages to send.");

        bytes32 batchMerkleRoot = getBatchMerkleRoot();

        // set merkle root in outbox and reset merkle tree
        fastOutbox[epochFinalized] = batchMerkleRoot;
        batchSize = 0;

        emit SendBatch(epochFinalized, batchMerkleRoot);
    }

    /**
     * @dev Sends an arbitrary message to Ethereum using the Safe Bridge, which relies on Arbitrum's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _epoch The blocknumber of the batch
     */
    function sendSafeFallback(uint256 _epoch) external payable override {
        bytes32 batchMerkleRoot = fastOutbox[_epoch];

        // Safe Bridge message envelope
        bytes4 methodSelector = IFastBridgeReceiver.verifySafe.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _epoch, batchMerkleRoot);
        // TODO: how much ETH should be provided for bridging? add an ISafeBridgeSender.bridgingCost() if needed
        _sendSafe(address(fastBridgeReceiver), safeMessageData);
    }

    // ************************ //
    // *       Internal       * //
    // ************************ //

    function _encode(address _receiver, bytes memory _calldata) internal view returns (bytes32 messageHash) {
        // Encode the receiver address with the function signature + _msgSender as the first argument, then the rest of the args
        bytes4 functionSelector;
        bytes memory _args;
        assembly {
            functionSelector := mload(add(_calldata, 32))
            mstore(add(_calldata, 4), mload(_calldata))
            _args := add(_calldata, 4)
        }
        bytes memory messageData = abi.encodePacked(
            _receiver,
            abi.encodeWithSelector(functionSelector, msg.sender, _args)
        );

        // Compute the hash over the message header (current batchSize acts as a nonce) and body (data).
        messageHash = sha256(abi.encodePacked(messageData, batchSize));
    }

    // ************************************ //
    // *            MerkleTree            * //
    // ************************************ //

    // ************************************* //
    // *          State Modifiers          * //
    // ************************************* //

    /** @dev Append _messageHash leaf into merkle tree.
     *  `O(log(n))` where
     *  `n` is the number of leaves (batchSize).
     *  Note: Although each insertion is O(log(n)),
     *  Complexity of n insertions is O(n).
     *  @param _messageHash The leaf to insert in the merkle tree.
     */
    function insertInBatch(bytes32 _messageHash) internal {
        uint256 size = batchSize + 1;
        batchSize = size;
        uint256 hashBitField = (size ^ (size - 1)) & size;
        uint256 height;
        while ((hashBitField & 1) == 0) {
            bytes32 node = batch[height];
            if (node > _messageHash)
                assembly {
                    // effecient hash
                    mstore(0x00, _messageHash)
                    mstore(0x20, node)
                    _messageHash := keccak256(0x00, 0x40)
                }
            else
                assembly {
                    // effecient hash
                    mstore(0x00, node)
                    mstore(0x20, _messageHash)
                    _messageHash := keccak256(0x00, 0x40)
                }
            hashBitField /= 2;
            height = height + 1;
        }
        batch[height] = _messageHash;
    }

    /** @dev Gets the history of merkle roots in the outbox
     *  @param _epoch requested epoch outbox history.
     */
    function getBatchMerkleRootHistory(uint256 _epoch) public view returns (bytes32) {
        return fastOutbox[_epoch];
    }

    /** @dev Gets the merkle root for the current epoch batch
     *  `O(log(n))` where
     *  `n` is the current number of leaves (batchSize)
     */
    function getBatchMerkleRoot() public view returns (bytes32) {
        bytes32 node;
        uint256 size = batchSize;
        uint256 height = 0;
        bool isFirstHash = true;
        while (size > 0) {
            if ((size & 1) == 1) {
                // avoid redundant calculation
                if (isFirstHash) {
                    node = batch[height];
                    isFirstHash = false;
                } else {
                    bytes32 hash = batch[height];
                    // effecient hash
                    if (hash > node)
                        assembly {
                            mstore(0x00, node)
                            mstore(0x20, hash)
                            node := keccak256(0x00, 0x40)
                        }
                    else
                        assembly {
                            mstore(0x00, hash)
                            mstore(0x20, node)
                            node := keccak256(0x00, 0x40)
                        }
                }
            }
            size /= 2;
            height++;
        }
        return node;
    }
}
