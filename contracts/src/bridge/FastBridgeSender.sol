// SPDX-License-Identifier: MIT

/**
 *  @authors: [@jaybuidl, @shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "./interfaces/IFastBridgeSender.sol";
import "./interfaces/ISafeBridgeSender.sol";
import "./interfaces/ISafeBridgeReceiver.sol";
import "./canonical/arbitrum/IArbSys.sol"; // Arbitrum sender specific

/**
 * Fast Bridge Sender
 * Counterpart of `FastBridgeReceiver`
 */
contract FastBridgeSender is IFastBridgeSender, ISafeBridgeSender {
    // **************************************** //
    // *                                      * //
    // *     Arbitrum Sender Specific         * //
    // *                                      * //
    // **************************************** //

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    IArbSys public constant ARB_SYS = IArbSys(address(100));

    /**
     * @dev Sends the merkle root state for _epoch to Ethereum using the Safe Bridge, which relies on Arbitrum's canonical bridge. It is unnecessary during normal operations but essential only in case of challenge.
     * @param _epoch The blocknumber of the batch
     */
    function sendSafeFallback(uint256 _epoch) external payable override {
        require(_epoch <= currentBatchID, "Invalid epoch.");
        bytes32 batchMerkleRoot = fastOutbox[_epoch];

        // Safe Bridge message envelope
        bytes4 methodSelector = ISafeBridgeReceiver.verifySafeBatch.selector;
        bytes memory safeMessageData = abi.encodeWithSelector(methodSelector, _epoch, batchMerkleRoot);

        bytes32 ticketID = _sendSafe(safeBridgeReceiver, safeMessageData);
        emit SentSafe(_epoch, ticketID);
    }

    function _sendSafe(address _receiver, bytes memory _calldata) internal override returns (bytes32) {
        uint256 ticketID = ARB_SYS.sendTxToL1(_receiver, _calldata);

        return bytes32(ticketID);
    }

    /**
     * @dev Constructor.
     * @param _epochPeriod The duration between epochs.
     * @param _safeBridgeReceiver The the Safe Bridge Router on Ethereum to the receiving chain.
     */
    constructor(uint256 _epochPeriod, address _safeBridgeReceiver) {
        epochPeriod = _epochPeriod;
        safeBridgeReceiver = _safeBridgeReceiver;
        unchecked {
            currentBatchID = block.timestamp / _epochPeriod - 1;
        }
    }

    // ************************************** //
    // *                                    * //
    // *         General Sender             * //
    // *                                    * //
    // ************************************** //

    // ************************************* //
    // *             Storage               * //
    // ************************************* //

    uint256 public immutable epochPeriod; // Epochs mark the period between potential batches of messages.
    uint256 public currentBatchID;
    mapping(uint256 => bytes32) public fastOutbox; // epoch count => merkle root of batched messages
    address public immutable safeBridgeReceiver;

    // merkle tree representation of a batch of messages
    // supports 2^64 messages.
    bytes32[64] public batch;
    uint256 public batchSize;

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @dev Sends an arbitrary message to Ethereum using the Fast Bridge.
     * @param _receiver The address of the contract on Ethereum which receives the calldata.
     * @param _calldata The receiving domain encoded message data / function arguments.
     */
    function sendFast(address _receiver, bytes memory _calldata) external override {
        (bytes32 fastMessageHash, bytes memory fastMessage) = _encode(_receiver, _calldata);
        emit MessageReceived(fastMessage, fastMessageHash);
        appendMessage(fastMessageHash); // add message to merkle tree
    }

    /**
     * Sends a batch of arbitrary message from one domain to another via the fast bridge mechanism.
     */
    function sendBatch() external override {
        uint256 epoch = block.timestamp / epochPeriod;
        require(fastOutbox[epoch] == 0, "Batch already sent for the current epoch.");
        require(batchSize > 0, "No messages to send.");

        // set merkle root in outbox
        bytes32 batchMerkleRoot = getMerkleRoot();
        fastOutbox[epoch] = batchMerkleRoot;
        emit BatchOutgoing(currentBatchID, batchSize, epoch, batchMerkleRoot);

        // reset
        batchSize = 0;
        currentBatchID = epoch;
    }

    // ************************ //
    // *       Internal       * //
    // ************************ //

    function _encode(address _receiver, bytes memory _calldata)
        internal
        view
        returns (bytes32 fastMessageHash, bytes memory fastMessage)
    {
        // Encode the receiver address with the function signature + arguments i.e calldata
        bytes32 sender = bytes32(bytes20(msg.sender));
        bytes32 receiver = bytes32(bytes20(_receiver));
        uint256 nonce = batchSize;
        // add sender and receiver with proper function selector formatting
        // [length][nonce][receiver: 1 slot padded][offset][function selector: 4 bytes no padding][msg.sender: 1 slot padded][function arguments: 1 slot padded]
        assembly {
            fastMessage := mload(0x40) // free memory pointer
            let lengthCalldata := mload(_calldata) // calldata length
            let lengthFastMesssageCalldata := add(lengthCalldata, 0x20) // add msg.sender
            let lengthEncodedMessage := add(lengthFastMesssageCalldata, 0x80) // 1 offsets, receiver, and lengthFastMesssageCalldata
            mstore(fastMessage, lengthEncodedMessage) // bytes length
            mstore(add(fastMessage, 0x20), nonce) // nonce
            mstore(add(fastMessage, 0x4c), receiver) // receiver
            mstore(add(fastMessage, 0x60), 0x60) // offset
            mstore(add(fastMessage, 0x80), lengthFastMesssageCalldata) // fast message length
            mstore(
                add(fastMessage, 0xa0),
                and(mload(add(_calldata, 0x20)), 0xFFFFFFFF00000000000000000000000000000000000000000000000000000000)
            ) // function selector
            mstore(add(fastMessage, 0xb0), sender) // sender

            let _cursor := add(fastMessage, 0xc4) // begin copying arguments of function call
            let _cursorCalldata := add(_calldata, 0x24) // beginning of arguments

            // copy all arguments
            for {
                let j := 0x00
            } lt(j, lengthCalldata) {
                j := add(j, 0x20)
            } {
                mstore(_cursor, mload(add(_cursorCalldata, j)))
                _cursor := add(_cursor, 0x20)
            }
            // update free pointer
            mstore(0x40, _cursor)
        }
        // Compute the hash over the message header (batchSize as nonce) and body (fastMessage).
        fastMessageHash = sha256(fastMessage);
    }

    // ********************************* //
    // *         Merkle Tree           * //
    // ********************************* //

    /**
     *  @dev Append data into merkle tree.
     *  `O(log(n))` where `n` is the number of leaves.
     *  Note: Although each insertion is O(log(n)), complexity of n insertions is O(n).
     *  Note: Inlined from `merkle/MerkleTree.sol` for performance.
     *  @param leaf The leaf (already hashed) to insert in the merkle tree.
     */
    function appendMessage(bytes32 leaf) internal {
        unchecked {
            // Differentiate leaves from interior nodes with different
            // hash functions to prevent 2nd order pre-image attack.
            // https://flawed.net.nz/2018/02/21/attacking-merkle-trees-with-a-second-preimage-attack/
            uint256 size = batchSize + 1;
            batchSize = size;
            uint256 hashBitField = (size ^ (size - 1)) & size;
            uint256 height;
            while ((hashBitField & 1) == 0) {
                bytes32 node = batch[height];
                if (node > leaf)
                    assembly {
                        // efficient hash
                        mstore(0x00, leaf)
                        mstore(0x20, node)
                        leaf := keccak256(0x00, 0x40)
                    }
                else
                    assembly {
                        // efficient hash
                        mstore(0x00, node)
                        mstore(0x20, leaf)
                        leaf := keccak256(0x00, 0x40)
                    }
                hashBitField /= 2;
                height++;
            }
            batch[height] = leaf;
        }
    }

    /**
     * @dev Gets the current merkle root.
     *  `O(log(n))` where `n` is the number of leaves.
     *  Note: Inlined from `merkle/MerkleTree.sol` for performance.
     */
    function getMerkleRoot() internal view returns (bytes32) {
        unchecked {
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
                        // efficient hash
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
}
