import { encodePacked, type Hash, keccak256 } from "viem";

export type Bytes32Hash = Hash;

/**
 * Computes the hash of a vote
 *
 * @param choice The choice being voted for
 * @param salt A random salt for commitment
 * @returns Bytes32Hash A keccak256 hash (bytes32) derived from the encoded vote parameters
 */
export const hashVote = (choice: bigint, salt: bigint): `0x${string}` => {
  const encoded = encodePacked(["uint256", "uint256"], [choice, salt]);
  return keccak256(encoded);
};
