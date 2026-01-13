import { keccak256, encodeAbiParameters, toBytes } from "viem";

/**
 * Hash a vote
 *
 * @param choice - the vote choice
 * @param salt - the deterministic salt
 * @param justification - optional justification string
 * @returns 0x-prefixed keccak256 hash
 */
export const hashVote = (choice: bigint, salt: bigint, justification?: string): `0x${string}` => {
  if (justification === undefined) {
    const encoded = encodeAbiParameters([{ type: "uint256" }, { type: "uint256" }], [choice, salt]);
    return keccak256(encoded);
  } else {
    const justificationHash = keccak256(toBytes(justification));
    const encoded = encodeAbiParameters(
      [{ type: "uint256" }, { type: "uint256" }, { type: "bytes32" }],
      [choice, salt, justificationHash]
    );
    return keccak256(encoded);
  }
};
