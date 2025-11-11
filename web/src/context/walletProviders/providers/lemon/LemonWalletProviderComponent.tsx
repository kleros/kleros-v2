import type { ReactNode } from "react";
import React, { useState } from "react";
import { createConfig, WagmiProvider } from "wagmi";
import { WalletProvider as WalletContextProvider } from "../../context";
import { chains, transports } from "../wagmi";
import { createLemonWalletProvider } from "./LemonWalletProvider";

interface LemonWalletProviderProps {
  children: ReactNode;
}

const wagmiConfig = createConfig({
  chains: chains,
  transports: transports,
});

export function LemonWalletProviderComponent({ children }: LemonWalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <LemonInitializer>{children}</LemonInitializer>
    </WagmiProvider>
  );
}

function LemonInitializer({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<string | undefined>(undefined);

  const setLemonWallet = (wallet: string | undefined) => {
    setWallet(wallet);
  };

  const walletProvider = createLemonWalletProvider(wallet, setLemonWallet);
  console.log("initializing LemonWalletProvider", { wallet });
  return (
    <WalletContextProvider
      value={{
        ...walletProvider,
        wallet,
        setWallet,
      }}
    >
      {children}
    </WalletContextProvider>
  );
}
