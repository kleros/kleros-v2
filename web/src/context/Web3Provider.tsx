import React from "react";

import {
  mainnet,
  arbitrumSepolia,
  arbitrum,
  gnosisChiado,
  sepolia,
  gnosis,
  type AppKitNetwork,
  hardhat,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { fallback, http, WagmiProvider, webSocket } from "wagmi";

import { configureSDK } from "@kleros/kleros-sdk/src/sdk";

import { ALL_CHAINS, DEFAULT_CHAIN } from "consts/chains";
import { HARDHAT_NODE_RPC, isLocalDeployment, isProductionDeployment } from "consts/index";

import { lightTheme } from "styles/themes";

const alchemyApiKey = import.meta.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  throw new Error("Alchemy API key is not set in ALCHEMY_API_KEY environment variable.");
}

const isProduction = isProductionDeployment();
const isLocalhost = isLocalDeployment();

// https://github.com/alchemyplatform/alchemy-sdk-js/blob/c4440cb/src/types/types.ts#L98-L153
const alchemyToViemChain: Record<number, string> = {
  [arbitrumSepolia.id]: "arb-sepolia",
  [arbitrum.id]: "arb-mainnet",
  [mainnet.id]: "eth-mainnet",
  [sepolia.id]: "eth-sepolia",
  [gnosis.id]: "gnosis-mainnet",
  [gnosisChiado.id]: "gnosis-chiado",
};

type AlchemyProtocol = "https" | "wss";

// https://github.com/alchemyplatform/alchemy-sdk-js/blob/c4440cb/src/util/const.ts#L16-L18
function alchemyURL(protocol: AlchemyProtocol, chainId: number | string): string {
  const network = alchemyToViemChain[chainId];
  if (!network) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return `${protocol}://${network}.g.alchemy.com/v2/${alchemyApiKey}`;
}

const alchemyTransport = (chain: AppKitNetwork) =>
  fallback([http(alchemyURL("https", chain.id)), webSocket(alchemyURL("wss", chain.id))]);
const defaultTransport = (chain: AppKitNetwork) =>
  fallback([http(chain.rpcUrls.default?.http?.[0]), webSocket(chain.rpcUrls.default?.webSocket?.[0])]);

export const getChainRpcUrl = (protocol: AlchemyProtocol, chainId: number | string) => {
  return alchemyURL(protocol, chainId);
};

export const getDefaultChainRpcUrl = (protocol: AlchemyProtocol) => {
  return getChainRpcUrl(protocol, DEFAULT_CHAIN);
};

export const getTransports = () => {
  if (isLocalhost)
    return {
      [hardhat.id]: http(HARDHAT_NODE_RPC),
      [mainnet.id]: alchemyTransport(mainnet),
    };

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

const chains = ALL_CHAINS as [AppKitNetwork, ...AppKitNetwork[]];
const transports = getTransports();

const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error("WalletConnect project ID is not set in WALLETCONNECT_PROJECT_ID environment variable.");
}

const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  transports,
});

configureSDK({
  client: {
    chain: isLocalhost ? hardhat : isProduction ? arbitrum : arbitrumSepolia,
    transport: transports[isLocalhost ? hardhat.id : isProduction ? arbitrum.id : arbitrumSepolia.id],
  },
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: chains,
  defaultNetwork: isLocalhost ? hardhat : isProduction ? arbitrum : arbitrumSepolia,
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
