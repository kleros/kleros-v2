import React from "react";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { type Chain } from "viem";
import { createConfig, fallback, http, WagmiProvider, webSocket } from "wagmi";
import { mainnet, arbitrumSepolia, arbitrum, gnosisChiado } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

import { ALL_CHAINS } from "consts/chains";
import { isProductionDeployment } from "consts/index";

import { lightTheme } from "styles/themes";

const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID ?? "";
export const alchemyApiKey = import.meta.env.ALCHEMY_API_KEY ?? "";

const chains = ALL_CHAINS as [Chain, ...Chain[]];

type AlchemyProtocol = "https" | "wss";
type AlchemyChain = "arb-sepolia" | "eth-mainnet" | "arb";
const alchemyURL = (protocol: AlchemyProtocol, chain: AlchemyChain) =>
  `${protocol}://${chain}.g.alchemy.com/v2/${alchemyApiKey}`;
const alchemyTransport = (chain: AlchemyChain) =>
  fallback([webSocket(alchemyURL("wss", chain)), http(alchemyURL("https", chain))]);

const transports = {
  [isProductionDeployment() ? arbitrum.id : arbitrumSepolia.id]: isProductionDeployment()
    ? alchemyTransport("arb")
    : alchemyTransport("arb-sepolia"),
  [mainnet.id]: alchemyTransport("eth-mainnet"),
  [gnosisChiado.id]: fallback([webSocket("wss://rpc.chiadochain.net/wss"), http("https://rpc.chiadochain.net")]),
};

const wagmiConfig = createConfig({
  chains,
  transports,
  connectors: [walletConnect({ projectId })],
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  defaultChain: isProductionDeployment() ? arbitrum : arbitrumSepolia,
  themeVariables: {
    "--w3m-color-mix": lightTheme.primaryPurple,
    "--w3m-color-mix-strength": 20,
  },
});

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <WagmiProvider config={wagmiConfig}> {children} </WagmiProvider>;
};

export default Web3Provider;
