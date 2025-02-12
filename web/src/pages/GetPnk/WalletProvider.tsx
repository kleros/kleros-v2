import React, { useRef, type FC, type PropsWithChildren } from "react";

import { useSyncWagmiConfig } from "@lifi/wallet-management";
import { useAvailableChains } from "@lifi/widget";
import { mainnet, arbitrumSepolia, arbitrum } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { injected, walletConnect } from "@wagmi/connectors";
import { createClient, http } from "viem";
import { WagmiProvider } from "wagmi";

import { isProductionDeployment } from "consts/index";

import { lightTheme } from "styles/themes";

const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID;

const connectors = [injected(), walletConnect({ projectId })];

export const WalletProvider: FC<PropsWithChildren> = ({ children }) => {
  const { chains } = useAvailableChains();
  const adapter = useRef<WagmiAdapter>();

  if (!adapter.current) {
    adapter.current = new WagmiAdapter({
      networks: [mainnet],
      projectId,
      client({ chain }) {
        return createClient({ chain, transport: http() });
      },
    });
  }

  useSyncWagmiConfig(adapter.current.wagmiConfig, connectors, chains);

  createAppKit({
    adapters: [adapter.current],
    networks: [mainnet],
    defaultNetwork: isProductionDeployment() ? arbitrum : arbitrumSepolia,
    allowUnsupportedChain: true,
    projectId,
    themeVariables: {
      "--w3m-color-mix": lightTheme.primaryPurple,
      "--w3m-color-mix-strength": 20,
      // overlay portal is at 9999
      "--w3m-z-index": 10000,
    },
  });

  return (
    <WagmiProvider config={adapter.current.wagmiConfig} reconnectOnMount={false}>
      {children}
    </WagmiProvider>
  );
};
