import { keccak256, Hex, Account } from "viem";

export const getSaltKey = (disputeId: bigint, roundIndex: number, voteIds: bigint[]) => {
  return `dispute-${disputeId}-round-${roundIndex}-voteids-${voteIds}`;
};

/**
 * Generates a deterministic salt by signing a message string and hashing the signature.
 *
 * @param signingAccount - The account used to sign
 * @param message - The message to sign (string)
 * @returns A keccak256 hash of the signed message
 */
export async function generateSalt(signingAccount: Account, message: string): Promise<Hex> {
  if (!signingAccount.signMessage) {
    throw new Error("signMessage method not available on signingAccount");
  }

  const signature = await signingAccount?.signMessage({ message });
  if (!signature) throw new Error("Cannot sign message");

  return keccak256(signature);
}
