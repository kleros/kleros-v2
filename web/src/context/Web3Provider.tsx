import React from "react";

import { type AppKitNetwork } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";

import { configureSDK } from "@kleros/kleros-sdk/src/sdk";

import { ALL_CHAINS, DEFAULT_CHAIN } from "consts/chains";

import { transports } from "src/config/rpc";
import { wagmiAdapter } from "src/config/wagmi";

import { lightTheme } from "styles/themes";

const alchemyApiKey = import.meta.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  throw new Error("Alchemy API key is not set in ALCHEMY_API_KEY environment variable.");
}
const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error("WalletConnect project ID is not set in WALLETCONNECT_PROJECT_ID environment variable.");
}

const chains = ALL_CHAINS as [AppKitNetwork, ...AppKitNetwork[]];
configureSDK({
  client: {
    chain: DEFAULT_CHAIN,
    transport: transports[DEFAULT_CHAIN.id],
  },
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: chains,
  defaultNetwork: DEFAULT_CHAIN,
  projectId,
  allowUnsupportedChain: true,
  themeVariables: {
    "--w3m-color-mix": lightTheme.primaryPurple,
    "--w3m-color-mix-strength": 20,
    // overlay portal is at 9999
    "--w3m-z-index": 10000,
  },
  features: {
    // adding these here to toggle in futute if needed
    // email: false,
    // socials: false,
    // onramp:false,
    // swap: false
  },
});
const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <WagmiProvider config={wagmiAdapter.wagmiConfig}> {children} </WagmiProvider>;
};

export default Web3Provider;
