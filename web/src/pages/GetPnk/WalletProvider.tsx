import React, { useRef, type FC, type PropsWithChildren } from "react";

import { useSyncWagmiConfig } from "@lifi/wallet-management";
import { useAvailableChains } from "@lifi/widget";
import { injected, walletConnect } from "@wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi";
import { createClient, http } from "viem";
import { arbitrum, arbitrumSepolia, mainnet } from "viem/chains";
import type { Config } from "wagmi";
import { createConfig, WagmiProvider } from "wagmi";

import { isProductionDeployment } from "consts/index";

import { lightTheme } from "styles/themes";

const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID;

const connectors = [injected(), walletConnect({ projectId })];

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
  const { chains } = useAvailableChains();
  const wagmi = useRef<Config>();

  if (!wagmi.current) {
    wagmi.current = createConfig({
      chains: [mainnet],
      client({ chain }) {
        return createClient({ chain, transport: http() });
      },
      ssr: true,
    });
  }

  useSyncWagmiConfig(wagmi.current, connectors, chains);

  createWeb3Modal({
    wagmiConfig: wagmi.current,
    projectId,
    defaultChain: isProductionDeployment() ? arbitrum : arbitrumSepolia,
    allowUnsupportedChain: true,
    themeVariables: {
      "--w3m-color-mix": lightTheme.primaryPurple,
      "--w3m-color-mix-strength": 20,
    },
  });
  return (
    <WagmiProvider config={wagmi.current} reconnectOnMount={false}>
      {children}
    </WagmiProvider>
  );
};
