// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.0;

import "../../merkle/MerkleProof.sol";

/**
 *  @title MerkleProofExpose
 *  @author Shotaro N. - <shawtarohgn@gmail.com>
 *  @dev A set of exposed funcitons to test the MerkleProof contract
 */
contract MerkleProofExposed is MerkleProof {
    /** @dev Validates membership of leaf in merkle tree with merkle proof.
     *  @param proof The merkle proof.
     *  @param leaf The leaf to validate membership in merkle tree.
     *  @param merkleRoot The root of the merkle tree.
     */
    function validateProof(
        bytes32[] memory proof,
        bytes32 leaf,
        bytes32 merkleRoot
    ) public pure returns (bool) {
        return _validateProof(proof, leaf, merkleRoot);
    }
}
