import { useAccount } from "wagmi";

async function getNonceFromBackend(): Promise<string> {
  // TODO: Change for Atlas real nonce fetching.
  return "unique-nonce-from-backend";
}

async function verifySignatureOnBackend({
  wallet,
  signature,
  message,
  nonce,
}: {
  wallet: `0x${string}`;
  signature: `0x${string}`;
  message: string;
  nonce: string;
}): Promise<{ verified: boolean; address?: string; error?: string }> {
  // TODO: change for Atlas real validation.
  return { verified: true, address: wallet };
}

export async function reownAuthenticate(): Promise<`0x${string}` | undefined> {
  const nonce = await getNonceFromBackend();
  const { isConnected, address } = useAccount();

  if (!isConnected) {
    throw new Error("Wallet not connected");
  }
  if (!address) {
    throw new Error("Wallet address not found");
  }

  const wallet = address as `0x${string}`;
  const result = await verifySignatureOnBackend({
    wallet,
    signature: "0xsignature", // TODO: get signature from Reown SDK
    message: "message", // TODO: get message from Reown SDK
    nonce,
  });
  return result.verified ? wallet : undefined;
}
