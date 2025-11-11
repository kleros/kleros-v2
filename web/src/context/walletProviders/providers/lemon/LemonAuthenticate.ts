import { authenticate, ChainId, TransactionResult } from "@lemoncash/mini-app-sdk";

async function getNonceFromBackend(): Promise<string> {
  // TODO: Change for Atlas real nonce fetching.
  return "l3m0nc45h";
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

export async function lemonAuthenticate(): Promise<`0x${string}` | undefined> {
  const nonce = await getNonceFromBackend();
  console.log("LemonAuthenticate", { nonce });
  const result = await authenticate({
    nonce,
    chainId: ChainId.ARBITRUM_SEPOLIA, // TODO
  });
  console.log("Lemon authenticate result", { result });
  if (result.result !== TransactionResult.SUCCESS) {
    throw new Error(`Authentication failed: ${result.result}`);
  }

  const { wallet, signature, message } = result.data;

  console.warn("Bypassing authentication verification - TODO: implement backend verification");
  const verificationResult = await verifySignatureOnBackend({
    wallet,
    signature,
    message,
    nonce,
  });

  if (verificationResult.verified) {
    return wallet;
  } else {
    throw new Error(`Signature verification failed: ${verificationResult.error || "Unknown error"}`);
  }
}
