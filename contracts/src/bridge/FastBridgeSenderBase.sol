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
    event SendBatch(uint256 indexed batchID, uint256 indexed epoch, bytes32 indexed batchMerkleRoot);

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
     * @param _calldata The receiving domain encoded message data / function arguments.
     */
    function sendFast(address _receiver, bytes memory _calldata) external override {
        (bytes32 fastMessageHash, bytes memory fastMessage) = _encode(_receiver, _calldata);

        emit MessageReceived(currentBatchID, fastMessage, batchSize);

        appendMessage(fastMessageHash); // add message to merkle tree
    }

    /**
     * Sends a batch of arbitrary message from one domain to another
     * via the fast bridge mechanism.
     */
    function sendBatch() external {
        uint256 epoch = block.timestamp / epochPeriod;
        require(fastOutbox[epoch] == 0, "Batch already sent for the current epoch.");
        require(batchSize > 0, "No messages to send.");

        // set merkle root in outbox and reset merkle tree
        bytes32 batchMerkleRoot = getMerkleRootAndReset();
        fastOutbox[epoch] = batchMerkleRoot;

        emit SendBatch(currentBatchID, epoch, batchMerkleRoot);

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
        // add sender and receiver with proper function selector formatting
        // [length][offset 1][offset 2][receiver: 1 slot padded][function selector: 4 bytes no padding][msg.sender: 1 slot padded][function arguments: 1 slot padded]
        assembly {
            fastMessage := mload(0x40) // free memory pointer
            let lengthCallData := mload(_calldata) // calldata length
            let lengthFastMesssage := add(lengthCallData, 0x20) // add msg.sender
            let lengthFastMesssageWithReceiverAndOffset := add(lengthFastMesssage, 0x60) // 1 offsets, receiver, and lengthFastMesssage
            mstore(fastMessage, lengthFastMesssageWithReceiverAndOffset) // bytes length
            mstore(add(fastMessage, 0x2c), receiver) // receiver
            mstore(add(fastMessage, 0x40), 0x40) // offset
            mstore(add(fastMessage, 0x60), lengthFastMesssage) // fast message length
            mstore(
                add(fastMessage, 0x80),
                and(mload(add(_calldata, 0x20)), 0xFFFFFFFF00000000000000000000000000000000000000000000000000000000)
            ) // function selector
            mstore(add(fastMessage, 0x90), sender) // sender

            let _cursor := add(fastMessage, 0xa4) // begin copying arguments of function call
            let _cursorCalldata := add(_calldata, 0x24) // beginning of arguments

            // copy all arguments
            for {
                let j := 0x00
            } lt(j, lengthCallData) {
                j := add(j, 0x20)
            } {
                mstore(_cursor, mload(add(_cursorCalldata, j)))
                _cursor := add(_cursor, 0x20)
            }
            // update free pointer
            mstore(0x40, _cursor)
        }
        // Compute the hash over the message header (batchSize as nonce) and body (fastMessage).
        fastMessageHash = sha256(abi.encode(fastMessage, batchSize));
    }
}
