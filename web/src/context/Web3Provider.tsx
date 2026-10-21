import React, { useEffect } from "react";
import { useTheme } from "styled-components";

import { PrivyProvider, useWallets } from "@privy-io/react-auth";
import { createConfig, useSetActiveWallet, WagmiProvider } from "@privy-io/wagmi";
import { type Chain } from "viem";
import { mainnet, arbitrumSepolia, arbitrum, gnosisChiado, sepolia, gnosis } from "viem/chains";
import { fallback, http, webSocket } from "wagmi";

import { configureSDK } from "@kleros/kleros-sdk/src/sdk";

import { ALL_CHAINS, DEFAULT_CHAIN, SUPPORTED_CHAINS } from "consts/chains";
import { isProductionDeployment } from "consts/index";

import QueryClientProvider from "./QueryClientProvider";

const alchemyApiKey = import.meta.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  throw new Error("Alchemy API key is not set in ALCHEMY_API_KEY environment variable.");
}

const isProduction = isProductionDeployment();

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

export const getChainRpcUrl = (protocol: AlchemyProtocol, chainId: number | string) => {
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

const projectId = import.meta.env.WALLETCONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error("WalletConnect project ID is not set in WALLETCONNECT_PROJECT_ID environment variable.");
}

export const wagmiConfig = createConfig({
  chains,
  transports,
});

const privyAppId = import.meta.env.REACT_APP_PRIVY_APP_ID;
if (!privyAppId) {
  throw new Error("Privy app ID is not set in REACT_APP_PRIVY_APP_ID environment variable.");
}

configureSDK({
  client: {
    chain: isProduction ? arbitrum : arbitrumSepolia,
    transport: transports[isProduction ? arbitrum.id : arbitrumSepolia.id],
  },
});

/**
 * Makes the Privy embedded wallet wagmi's active wallet. Pre-authorized injected wallets (e.g. Rabby) are
 * listed by Privy as connected wallets and could otherwise be wagmi's active account for an email/Google user.
 */
const ActiveWalletSync: React.FC = () => {
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const embedded = wallets.find((wallet) => wallet.walletClientType === "privy");

  useEffect(() => {
    if (embedded) setActiveWallet(embedded).catch(() => undefined);
  }, [embedded, wallets.length, setActiveWallet]);

  return null;
};

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["email", "google", "wallet"],
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
        defaultChain: SUPPORTED_CHAINS[DEFAULT_CHAIN],
        supportedChains: chains,
        externalWallets: { walletConnect: { enabled: true } },
        walletConnectCloudProjectId: projectId,
        appearance: {
          theme: theme.name === "light" ? "light" : "dark",
          accentColor: theme.secondaryPurple as `#${string}`,
          walletList: ["detected_ethereum_wallets", "wallet_connect"],
        },
      }}
    >
      <QueryClientProvider>
        <WagmiProvider config={wagmiConfig}>
          <ActiveWalletSync />
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default Web3Provider;
