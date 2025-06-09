// SPDX-License-Identifier: MIT

/**
 *  @custom:authors: [unknownunknown1]
 *  @custom:reviewers: []
 *  @custom:auditors: []
 *  @custom:bounties: []
 *  @custom:deployments: []
 */

pragma solidity 0.8.24;

import "../arbitration/SortitionSumTree.sol";

/// @title SortitionModuleMock
/// @dev Adds getter functions to sortition module for Foundry tests.
contract SortitionModuleMock is SortitionSumTree {
    function getSortitionProperties(bytes32 _key) external view returns (uint256 K, uint256 nodeLength) {
        SortitionSumTree storage tree = sortitionSumTrees[_key];
        K = tree.K;
        nodeLength = tree.nodes.length;
    }
}
