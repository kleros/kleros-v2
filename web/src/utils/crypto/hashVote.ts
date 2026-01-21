import { keccak256, encodeAbiParameters } from "viem";

/**
 * Hash a vote
 *
 * @param choice - the vote choice
 * @param salt - the deterministic salt
 * @returns 0x-prefixed keccak256 hash
 */
export const hashVote = (choice: bigint, salt: bigint): `0x${string}` => {
  const encoded = encodeAbiParameters([{ type: "uint256" }, { type: "uint256" }], [choice, salt]);
  return keccak256(encoded);
};
