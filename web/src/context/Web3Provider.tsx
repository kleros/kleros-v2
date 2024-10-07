import React from "react";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { type Chain } from "viem";
import { createConfig, fallback, http, WagmiProvider, webSocket } from "wagmi";
import { arbitrum, arbitrumSepolia, gnosis, gnosisChiado, mainnet, sepolia } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

import { ALL_CHAINS, DEFAULT_CHAIN } from "consts/chains";
import { isProductionDeployment } from "consts/index";

import { lightTheme } from "styles/themes";
import { Web3AuthConnectorInstance, Web3AuthInstance } from "~src/utils/Web3AuthInstance";

const alchemyApiKey = import.meta.env.ALCHEMY_API_KEY ?? "";
const isProduction = isProductionDeployment();

// https://github.com/alchemyplatform/alchemy-sdk-js/blob/96b3f62/src/types/types.ts#L98-L119
const alchemyToViemChain = {
  [arbitrum.id]: "arb-mainnet",
  [arbitrumSepolia.id]: "arb-sepolia",
  [mainnet.id]: "eth-mainnet",
  [sepolia.id]: "eth-sepolia",
};

type AlchemyProtocol = "https" | "wss";

// https://github.com/alchemyplatform/alchemy-sdk-js/blob/96b3f62/src/util/const.ts#L16-L18
const alchemyURL = (protocol: AlchemyProtocol, chainId: number) =>
  `${protocol}://${alchemyToViemChain[chainId]}.g.alchemy.com/v2/${alchemyApiKey}`;

export const getChainRpcUrl = (protocol: AlchemyProtocol, chainId: number) => {
  return alchemyURL(protocol, chainId);
};

export const getDefaultChainRpcUrl = (protocol: AlchemyProtocol) => {
  return getChainRpcUrl(protocol, DEFAULT_CHAIN);
};

export const getTransports = () => {
  const alchemyTransport = (chain: Chain) =>
    fallback([http(alchemyURL("https", chain.id)), webSocket(alchemyURL("wss", chain.id))]);
  const defaultTransport = (chain: Chain) =>
    fallback([http(chain.rpcUrls.default?.http?.[0]), webSocket(chain.rpcUrls.default?.webSocket?.[0])]);

  return {
    [isProduction ? arbitrum.id : arbitrumSepolia.id]: isProduction
      ? alchemyTransport(arbitrum)
      : alchemyTransport(arbitrumSepolia),
    [isProduction ? gnosis.id : gnosisChiado.id]: isProduction
      ? defaultTransport(gnosis)
      : defaultTransport(gnosisChiado),
    [mainnet.id]: alchemyTransport(mainnet), // Always enabled for ENS resolution
  };
};

const chains = ALL_CHAINS as [Chain, ...Chain[]];
const transports = getTransports();
const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID ?? "";

// Create Web3Auth Instance
const web3AuthInstance = Web3AuthInstance(chains, "Kleros-V2");

const wagmiConfig = createConfig({
  chains,
  transports,
  connectors: [walletConnect({ projectId }), Web3AuthConnectorInstance(web3AuthInstance)],
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
