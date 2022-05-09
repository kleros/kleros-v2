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
    // supports 2^32-1 messages.
    bytes32[32] public branch;
    uint256 public count;

    // block number => merkle root history
    mapping(uint256 => bytes32) private history;

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /** @dev Append data into merkle tree.
     *  `O(log(n))` where
     *  `n` is the number of leaves.
     *  Note: Although each insertion is O(log_2(n)),
     *  Total complexity of n insertions is O(n).
     *  @param data The data to insert in the merkle tree.
     */
    function append(bytes memory data) public {
        bytes32 leaf = sha256(data);
        count += 1;
        uint256 size = count;
        uint256 hashBitField = (size ^ (size - 1)) & size;

        for (uint256 height = 0; height < 32; height++) {
            if ((hashBitField & 1) == 1) {
                branch[height] = leaf;
                return;
            }
            bytes32 node = branch[height];
            // effecient hash
            if (node > leaf)
                assembly {
                    mstore(0x00, leaf)
                    mstore(0x20, node)
                    leaf := keccak256(0x00, 0x40)
                }
            else
                assembly {
                    mstore(0x00, node)
                    mstore(0x20, leaf)
                    leaf := keccak256(0x00, 0x40)
                }
            hashBitField /= 2;
        }
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
            // avoid redundant calculation
            if ((size & 1) == 1) {
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
