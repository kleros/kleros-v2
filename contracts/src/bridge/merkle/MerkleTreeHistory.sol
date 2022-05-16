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
 *  @title MerkleTreeHistory
 *  @author Shotaro N. - <shawtarohgn@gmail.com>
 *  @dev An efficient append only merkle tree with history.
 */
contract MerkleTreeHistory {
    // ***************************** //
    // *         Storage           * //
    // ***************************** //

    // merkle tree representation
    // supports 2^64 messages.
    bytes32[64] public branch;
    uint256 public count;

    // block number => merkle root history
    mapping(uint256 => bytes32) private history;

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /** @dev Append data into merkle tree.
     *  `O(log(n))` where
     *  `n` is the number of leaves.
     *  Note: Although each insertion is O(log(n)),
     *  Complexity of n insertions is O(n).
     *  @param data The data to insert in the merkle tree.
     */
    function append(bytes memory data) public {
        // Differentiate leaves from interior nodes with different
        // hash functions to prevent 2nd order pre-image attack.
        // https://flawed.net.nz/2018/02/21/attacking-merkle-trees-with-a-second-preimage-attack/
        bytes32 leaf = sha256(data);
        uint256 size = count + 1;
        count = size;
        uint256 hashBitField = (size ^ (size - 1)) & size;
        uint256 height;
        while ((hashBitField & 1) == 0) {
            bytes32 node = branch[height];
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
        branch[height] = leaf;
    }

    /** @dev Saves the merkle root state in history and resets.
     *  `O(log(n))` where
     *  `n` is the number of leaves.
     */
    function reset() internal {
        history[block.number] = getMerkleRoot();
        count = 0;
    }

    /** @dev Gets the merkle root history
     *  `O(log(n))` where
     *  `n` is the number of leaves.
     *  @param blocknumber requested blocknumber.
     */
    function getMerkleRootHistory(uint256 blocknumber) public view returns (bytes32) {
        if (blocknumber == block.number) return getMerkleRoot();

        return history[blocknumber];
    }

    /** @dev Gets the current merkle root.
     *  `O(log(n))` where
     *  `n` is the number of leaves.
     */
    function getMerkleRoot() public view returns (bytes32) {
        bytes32 node;
        uint256 size = count;
        uint256 height = 0;
        bool isFirstHash = true;
        while (size > 0) {
            if ((size & 1) == 1) {
                // avoid redundant calculation
                if (isFirstHash) {
                    node = branch[height];
                    isFirstHash = false;
                } else {
                    bytes32 hash = branch[height];
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
