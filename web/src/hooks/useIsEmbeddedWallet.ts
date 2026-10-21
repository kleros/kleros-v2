import { usePrivy, useWallets } from "@privy-io/react-auth";

/**
 * Returns the authenticated user's Privy embedded wallet, if any.
 * The embedded wallet is only created for email/Google users, so when it exists it is the wallet the user
 * logged in with. Injected wallets that merely authorized the site earlier (e.g. Rabby) must never take over.
 */
export const useEmbeddedWallet = () => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  if (!authenticated) return undefined;
  return wallets.find((wallet) => wallet.walletClientType === "privy");
};

export const useIsEmbeddedWallet = (): boolean => Boolean(useEmbeddedWallet());
