import { useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

/**
 * Returns the Privy embedded wallet matching wagmi's active account, if any.
 */
export const useEmbeddedWallet = () => {
  const { address } = useAccount();
  const { wallets } = useWallets();
  if (!address) return undefined;
  return wallets.find(
    (wallet) => wallet.walletClientType === "privy" && wallet.address.toLowerCase() === address.toLowerCase()
  );
};

export const useIsEmbeddedWallet = (): boolean => Boolean(useEmbeddedWallet());
