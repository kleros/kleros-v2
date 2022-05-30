// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../MerkleTree.sol";

/**
 *  @title MerkleTreeExposed
 *  @author Shotaro N. - <shawtarohgn@gmail.com>
 *  @dev Exposes MerkleTree for testing
 */
contract MerkleTreeExposed is MerkleTree {
    function _appendMessage(bytes memory _leaf) public {
        appendMessage(sha256(_leaf));
    }

    function _getMerkleRoot() public view returns (bytes32 merkleroot) {
        merkleroot = getMerkleRoot();
    }
}
