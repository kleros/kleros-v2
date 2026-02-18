import { keccak256, toBytes, encodeAbiParameters } from "viem";

/**
 * @description Computes the hash of a justification using ABI encoding.
 * Replicates hashJustification implementation from [ShutterDisputeKit](https://github.com/kleros/kleros-v2/blob/d944e197384d9065de2e0a4414fb8fb98b727f6e/contracts/src/arbitration/dispute-kits/DisputeKitShutter.sol#L151C1-L158C1)
 * @param salt A random salt for commitment
 * @param justification The justification for the vote
 * @return bytes32 The hash of the encoded justification
 */
export function hashJustification(salt: bigint, justification: string): `0x${string}` {
  const justificationHash = keccak256(toBytes(justification));

  const encoded = encodeAbiParameters(
    [
      { type: "uint256" }, // _salt
      { type: "bytes32" }, // keccak256(bytes(_justification))
    ],
    [salt, justificationHash]
  );

  return keccak256(encoded);
}
