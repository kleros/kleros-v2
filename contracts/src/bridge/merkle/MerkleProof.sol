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
    function _validateProof(
        bytes32[] memory proof,
        bytes32 leaf,
        bytes32 merkleRoot
    ) internal pure returns (bool) {
        return (merkleRoot == _calculateRoot(proof, leaf));
    }

    /** @dev Calculates merkle root from proof.
     *  @param proof The merkle proof.
     *  @param leaf The leaf to validate membership in merkle tree..
     */
    function _calculateRoot(bytes32[] memory proof, bytes32 leaf) private pure returns (bytes32) {
        uint256 proofLength = proof.length;
        require(proofLength <= 32, "Invalid Proof");
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
