import React, { useEffect } from "react";
import { useTheme } from "styled-components";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { Chain } from "viem";
import { createConfig, fallback, http, WagmiProvider, webSocket } from "wagmi";
import { mainnet, arbitrumSepolia, gnosisChiado } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

import { ALL_CHAINS } from "consts/chains";

const projectId = process.env.WALLETCONNECT_PROJECT_ID ?? "6efaa26765fa742153baf9281e218217";
export const alchemyApiKey = process.env.ALCHEMY_API_KEY ?? "";

const chains = ALL_CHAINS as [Chain, ...Chain[]];

type AlchemyProtocol = "https" | "wss";
type AlchemyChain = "arb-sepolia" | "eth-mainnet";
const alchemyURL = (protocol: AlchemyProtocol, chain: AlchemyChain) =>
  `${protocol}://${chain}.g.alchemy.com/v2/${alchemyApiKey}`;
const alchemyTransport = (chain: AlchemyChain) =>
  fallback([webSocket(alchemyURL("wss", chain)), http(alchemyURL("https", chain))]);

const wagmiConfig = createConfig({
  chains,
  transports: {
    [arbitrumSepolia.id]: alchemyTransport("arb-sepolia"),
    [mainnet.id]: alchemyTransport("eth-mainnet"),
    [gnosisChiado.id]: fallback([webSocket("wss://rpc.chiadochain.net/wss"), http("https://rpc.chiadochain.net")]),
  },
  connectors: [walletConnect({ projectId })],
});

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  useEffect(() => {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      chains,
      themeVariables: {
        "--w3m-accent": theme.primaryPurple,
        "--w3m-color-mix": theme.primaryPurple,
        "--w3m-color-mix-strength": 100,
      },
    });
  }, [theme]);

  return (
    <>
      <WagmiProvider config={wagmiConfig}> {children} </WagmiProvider>
    </>
  );
};

export default Web3Provider;
