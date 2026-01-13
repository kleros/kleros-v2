import { keccak256, encodeAbiParameters, toBytes } from "viem";

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
