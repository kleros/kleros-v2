import { encodePacked, keccak256 } from "viem";

/**
 * Computes the hash of a vote
 *
 * @param choice The choice being voted for
 * @param salt A random salt for commitment
 * @return bytes32 The hash of the encoded vote parameters
 */
export const hashVote = (choice: bigint, salt: bigint): `0x${string}` => {
  const encoded = encodePacked(["uint256", "uint256"], [choice, salt]);
  return keccak256(encoded);
};
