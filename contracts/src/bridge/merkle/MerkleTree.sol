// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

/**
 *  @title MerkleTree
 *  @author Shotaro N. - <shawtarohgn@gmail.com>
 *  @dev An efficient append only merkle tree.
 */
contract MerkleTree {
    // ***************************** //
    // *         Storage           * //
    // ***************************** //

    // merkle tree representation of a batch of messages
    // supports 2^64 messages.
    bytes32[64] private batch;
    uint256 internal batchSize;

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /** @dev Append data into merkle tree.
     *  `O(log(n))` where
     *  `n` is the number of leaves.
     *  Note: Although each insertion is O(log(n)),
     *  Complexity of n insertions is O(n).
     *  @param leaf The leaf (already hashed) to insert in the merkle tree.
     */
    function _appendMessage(bytes32 leaf) internal {
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
                    // effecient hash
                    mstore(0x00, leaf)
                    mstore(0x20, node)
                    leaf := keccak256(0x00, 0x40)
                }
            else
                assembly {
                    // effecient hash
                    mstore(0x00, node)
                    mstore(0x20, leaf)
                    leaf := keccak256(0x00, 0x40)
                }
            hashBitField /= 2;
            height = height + 1;
        }
        batch[height] = leaf;
    }

    /** @dev Saves the merkle root state in history and resets.
     *  `O(log(n))` where
     *  `n` is the number of leaves.
     */
    function _getMerkleRootAndReset() internal returns (bytes32 batchMerkleRoot) {
        batchMerkleRoot = _getMerkleRoot();
        batchSize = 0;
    }

    /** @dev Gets the current merkle root.
     *  `O(log(n))` where
     *  `n` is the number of leaves.
     */
    function _getMerkleRoot() internal view returns (bytes32) {
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
