// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SortitionTrees, TreeKey, CourtID} from "../libraries/SortitionTrees.sol";

/// @title SortitionTreesMock
/// @dev Test contract to expose SortitionTrees library functions for testing
contract SortitionTreesMock {
    using SortitionTrees for mapping(TreeKey => SortitionTrees.Tree);

    // Storage for multiple test trees
    mapping(TreeKey => SortitionTrees.Tree) public trees;

    // Court hierarchy helpers (for testing parent-child relationships)
    mapping(uint96 => uint96[]) public childCourts;
    mapping(uint96 => uint96) public parentCourt;

    // ************************************* //
    // *         Main Functions            * //
    // ************************************* //

    /// @dev Create a sortition sum tree for a court
    function createTree(uint96 _courtID, uint256 _k) external {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        trees.createTree(key, _k);
    }

    /// @dev Set stake for a juror in a specific court
    function set(uint96 _courtID, address _account, uint256 _value) external {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        bytes32 stakePathID = SortitionTrees.toStakePathID(_account, _courtID);
        SortitionTrees.set(trees[key], _value, stakePathID);
    }

    /// @dev Draw a juror from a court's tree
    function draw(
        uint96 _courtID,
        uint256 _disputeID,
        uint256 _nonce,
        uint256 _randomNumber
    ) external view returns (address drawnAddress, uint96 fromSubcourtID) {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        return SortitionTrees.draw(trees[key], _disputeID, _nonce, _randomNumber);
    }

    /// @dev Get stake of a juror in a specific court
    function stakeOf(uint96 _courtID, address _account) external view returns (uint256) {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        bytes32 stakePathID = SortitionTrees.toStakePathID(_account, _courtID);
        return SortitionTrees.stakeOf(trees[key], stakePathID);
    }

    // ************************************* //
    // *      Multi-Court Operations       * //
    // ************************************* //

    /// @dev Set stake for a juror across multiple courts (for testing hierarchy)
    function setStakeInHierarchy(uint96[] calldata _courtIDs, address _account, uint256 _value) external {
        for (uint256 i = 0; i < _courtIDs.length; i++) {
            this.set(_courtIDs[i], _account, _value);
        }
    }

    /// @dev Get stakes of a juror across multiple courts
    function getStakesAcrossCourts(
        address _account,
        uint96[] calldata _courtIDs
    ) external view returns (uint256[] memory stakes) {
        stakes = new uint256[](_courtIDs.length);
        for (uint256 i = 0; i < _courtIDs.length; i++) {
            stakes[i] = this.stakeOf(_courtIDs[i], _account);
        }
    }

    // ************************************* //
    // *       Court Hierarchy Setup      * //
    // ************************************* //

    /// @dev Set parent court for testing hierarchy
    function setParentCourt(uint96 _childCourt, uint96 _parentCourt) external {
        parentCourt[_childCourt] = _parentCourt;
    }

    /// @dev Add child court for testing hierarchy
    function addChildCourt(uint96 _parentCourt, uint96 _childCourt) external {
        childCourts[_parentCourt].push(_childCourt);
    }

    /// @dev Get child courts
    function getChildCourts(uint96 _parentCourt) external view returns (uint96[] memory) {
        return childCourts[_parentCourt];
    }

    // ************************************* //
    // *       Tree State Inspection      * //
    // ************************************* //

    /// @dev Get all nodes in a tree
    function getTreeNodes(uint96 _courtID) external view returns (uint256[] memory) {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        return trees[key].nodes;
    }

    /// @dev Get tree K value
    function getTreeK(uint96 _courtID) external view returns (uint256) {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        return trees[key].K;
    }

    /// @dev Get tree stack
    function getTreeStack(uint96 _courtID) external view returns (uint256[] memory) {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        return trees[key].stack;
    }

    /// @dev Get node index for a juror in a court
    function getNodeIndex(uint96 _courtID, address _account) external view returns (uint256) {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        bytes32 stakePathID = SortitionTrees.toStakePathID(_account, _courtID);
        return trees[key].IDsToNodeIndexes[stakePathID];
    }

    /// @dev Check if a court tree exists
    function courtExists(uint96 _courtID) external view returns (bool) {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        return trees[key].K != 0;
    }

    /// @dev Get the root sum (total stakes) of a court
    function getRootSum(uint96 _courtID) external view returns (uint256) {
        TreeKey key = CourtID.wrap(_courtID).toTreeKey();
        if (trees[key].nodes.length == 0) return 0;
        return trees[key].nodes[0];
    }

    // ************************************* //
    // *         Utility Functions        * //
    // ************************************* //

    /// @dev Test function to pack address and court ID
    function testToStakePathID(address _account, uint96 _courtID) external pure returns (bytes32) {
        return SortitionTrees.toStakePathID(_account, _courtID);
    }

    /// @dev Test function to unpack stake path ID
    function testToAccountAndCourtID(bytes32 _stakePathID) external pure returns (address account, uint96 courtID) {
        return SortitionTrees.toAccountAndCourtID(_stakePathID);
    }

    /// @dev Test function to convert court ID to tree key
    function testToTreeKey(uint96 _courtID) external pure returns (TreeKey) {
        return CourtID.wrap(_courtID).toTreeKey();
    }
}
