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
 *  @title MerkleProof
 *  @author Shotaro N. - <shawtarohgn@gmail.com>
 *  @dev A set of funcitons to verify merkle proofs.
 */
contract MerkleProof {
    /** @dev Validates membership of leaf in merkle tree with merkle proof.
     *  @param proof The merkle proof.
     *  @param leaf The leaf to validate membership in merkle tree.
     *  @param merkleRoot The root of the merkle tree.
     */
    function validateProof(
        bytes32[] memory proof,
        bytes32 leaf,
        bytes32 merkleRoot
    ) internal pure returns (bool) {
        return (merkleRoot == calculateRoot(proof, leaf));
    }

    /** @dev Validates membership of leaf in merkle tree with merkle proof.
     *  @param proof The merkle proof.
     *  @param data The data to validate membership in merkle tree.
     *  @param merkleRoot The root of the merkle tree.
     */
    function validateProof(
        bytes32[] memory proof,
        bytes memory data,
        bytes32 merkleRoot
    ) public pure returns (bool) {
        return validateProof(proof, keccak256(data), merkleRoot);
    }

    /** @dev Calculates merkle root from proof.
     *  @param proof The merkle proof.
     *  @param leaf The leaf to validate membership in merkle tree..
     */
    function calculateRoot(bytes32[] memory proof, bytes32 leaf) internal pure returns (bytes32) {
        uint256 proofLength = proof.length;
        require(proofLength <= 64, "Invalid Proof");
        bytes32 h = leaf;
        for (uint256 i = 0; i < proofLength; i++) {
            bytes32 proofElement = proof[i];
            // effecient hash
            if (proofElement > h)
                assembly {
                    mstore(0x00, h)
                    mstore(0x20, proofElement)
                    h := keccak256(0x00, 0x40)
                }
            else
                assembly {
                    mstore(0x00, proofElement)
                    mstore(0x20, h)
                    h := keccak256(0x00, 0x40)
                }
        }
        return h;
    }
}
