// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

library SortitionSumTreeFactory {
    /* Structs */

    struct SortitionSumTree {
        uint256 K; // The maximum number of childs per node.
        // We use this to keep track of vacant positions in the tree after removing a leaf. This is for keeping the tree as balanced as possible without spending gas on moving nodes around.
        uint256[] stack;
        uint256[] nodes;
        // Two-way mapping of IDs to node indexes. Note that node index 0 is reserved for the root node, and means the ID does not have a node.
        mapping(bytes32 => uint256) IDsToNodeIndexes;
        mapping(uint256 => bytes32) nodeIndexesToIDs;
    }

    /* Storage */

    struct SortitionSumTrees {
        mapping(bytes32 => SortitionSumTree) sortitionSumTrees;
    }

    function createTree(
        SortitionSumTrees storage self,
        bytes32 _key,
        uint256 _K
    ) public {
        SortitionSumTree storage tree = self.sortitionSumTrees[_key];
        require(tree.K == 0, "Tree already exists.");
        require(_K > 1, "K must be greater than one.");
        tree.K = _K;
        // tree.stack.length = 0;
        // tree.nodes.length = 0;
        tree.nodes.push(0);
    }
}
