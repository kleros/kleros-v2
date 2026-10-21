import { useCallback, useMemo } from "react";

import { useSignMessage } from "@privy-io/react-auth";
import type { Address, Hex } from "viem";

import { useEmbeddedWallet } from "./useIsEmbeddedWallet";

/**
 * Returns a silent message signer (no Privy "Sign message" modal) when the Privy embedded wallet is active,
 * and undefined for external wallets, which keep their own signing prompt.
 */
export const useEmbeddedSignMessage = ():
  | ((args: { message: string; address: Address }) => Promise<Hex>)
  | undefined => {
  const embeddedWallet = useEmbeddedWallet();
  const { signMessage } = useSignMessage();
  const isEmbedded = Boolean(embeddedWallet);

  const signSilently = useCallback(
    async ({ message, address }: { message: string; address: Address }) => {
      const { signature } = await signMessage({ message }, { uiOptions: { showWalletUIs: false }, address });
      return signature as Hex;
    },
    [signMessage]
  );

  return useMemo(() => (isEmbedded ? signSilently : undefined), [isEmbedded, signSilently]);
};
