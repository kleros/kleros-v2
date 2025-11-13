import { arbitrum, arbitrumSepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import React, { type ReactNode } from "react";

import { WagmiProvider } from "wagmi";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { lightTheme } from "styles/themes";
import { WalletContextProvider } from "../..";
import { chains, isProduction, projectId, transports } from "../wagmi";
import { useReownWalletProvider } from "./ReownWalletProvider";

interface WalletProviderProps {
  children: ReactNode;
}

export function ReownWalletProviderComponent({ children }: WalletProviderProps) {
  const wagmiAdapter = new WagmiAdapter({
    networks: chains,
    projectId,
    transports,
  });

  createAppKit({
    adapters: [wagmiAdapter],
    networks: chains,
    defaultNetwork: isProduction ? arbitrum : arbitrumSepolia,
    projectId,
    allowUnsupportedChain: true,
    themeVariables: {
      "--w3m-color-mix": lightTheme.primaryPurple,
      "--w3m-color-mix-strength": 20,
      // overlay portal is at 9999
      "--w3m-z-index": 10000,
    },
    features: {
      // adding these here to toggle in future if needed
      // email: false,
      // socials: false,
      // onramp:false,
      // swap: false
    },
  });

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <ReownInitializer>{children}</ReownInitializer>
    </WagmiProvider>
  );
}

function ReownInitializer({ children }: { children: React.ReactNode }) {
  const walletProvider = useReownWalletProvider();
  return <WalletContextProvider value={walletProvider}>{children}</WalletContextProvider>;
}

export default ReownWalletProviderComponent;
