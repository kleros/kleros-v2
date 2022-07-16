// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../../merkle/MerkleTree.sol";

/**
 *  @title MerkleTreeExposed
 *  @author Shotaro N. - <shawtarohgn@gmail.com>
 *  @dev Exposes MerkleTree for testing
 */
contract MerkleTreeExposed is MerkleTree {
    function appendMessage(bytes memory _leaf) public {
        _appendMessage(sha256(_leaf));
    }

    function getMerkleRoot() public view returns (bytes32 merkleroot) {
        merkleroot = _getMerkleRoot();
    }
}
