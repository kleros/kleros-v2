// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

library MerkleTreeFactory {

    struct MerkleTree {
        bytes32[32] branch;
        bytes32[32] zero_hashes;
        mapping(uint256 => bytes32) history;
        uint256 depositCount;
    }

    function createMerkleTree(MerkleTree storage self) external{
        for (uint height = 0; height <  31; height++)
            self.zero_hashes[height + 1] = keccak256(abi.encodePacked(self.zero_hashes[height], self.zero_hashes[height]));
    }


    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //


    function get_deposit_root(MerkleTree storage self) public view returns (bytes32) {
        bytes32 node;
        uint256 size = self.depositCount;
        uint256 height = 0;
        while(size >0){
            if ((size & 1) == 1)
                node = keccak256(abi.encodePacked(self.branch[height], node));
            else
                node = keccak256(abi.encodePacked(node, self.zero_hashes[height]));
            size /= 2;
            height++;
        }
        return node;
    }

    function get_deposit_root(MerkleTree storage self, uint256 blockNumber) external view returns (bytes32) {
        if (blockNumber == block.number)
            return get_deposit_root(self);

        return self.history[blockNumber];
    }

    function deposit(
        MerkleTree storage self,
        bytes32 message
    ) external {
        // Add deposit data root to Merkle tree (update a single `branch` node)
        self.depositCount += 1;
        uint size = self.depositCount;
        uint height = 0;
        while(size >0){
            if ((size & 1) == 1) {
                self.branch[height] = message;
            }
            message = keccak256(abi.encodePacked(self.branch[height], message));
            size /= 2;
            height++;
        }
    }

    function reset(MerkleTree storage self) external {
        self.history[block.number]=get_deposit_root(self);
        delete self.branch;
        self.depositCount = 0;
    }

    function checkMembership(
        bytes32[] memory nodes,
        uint256 route,
        bytes32 item,
        bytes32 merkleroot
    ) public pure returns (bool){
        return(merkleroot == calculateRoot(nodes,route,item));
    }

    function calculateRoot(
        bytes32[] memory nodes,
        uint256 route,
        bytes32 item
    ) internal pure returns (bytes32) {
        uint256 proofItems = nodes.length;
        require(proofItems <= 256);
        bytes32 h = item;
        for (uint256 i = 0; i < proofItems; i++) {
            if (route % 2 == 0) {
                h = keccak256(abi.encodePacked(h, nodes[i]));
            } else {
                h = keccak256(abi.encodePacked(nodes[i], h));
            }
            route /= 2;
        }
        return h;
    }
}
