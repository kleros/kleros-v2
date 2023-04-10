import React from "react";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { arbitrumGoerli, mainnet } from "wagmi/chains";

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, arbitrumGoerli],
  [publicProvider()]
);

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  provider,
  webSocketProvider,
});

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <WagmiConfig client={client}> {children} </WagmiConfig>;

export default Web3Provider;
