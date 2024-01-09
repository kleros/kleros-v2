import React from "react";
import { EthereumClient, w3mConnectors } from "@web3modal/ethereum";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, arbitrumSepolia, gnosisChiado } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { useToggleTheme } from "hooks/useToggleThemeContext";
import { useTheme } from "styled-components";

const chains = [arbitrumSepolia, mainnet, gnosisChiado];
const projectId = process.env.WALLETCONNECT_PROJECT_ID ?? "6efaa26765fa742153baf9281e218217";

const { publicClient, webSocketPublicClient } = configureChains(chains, [
  alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY ?? "" }),
  jsonRpcProvider({
    rpc: () => ({
      http: `https://rpc.chiadochain.net`,
      webSocket: `wss://rpc.chiadochain.net/wss`,
    }),
  }),
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 2, chains }),
  publicClient,
  webSocketPublicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeToggle] = useToggleTheme();
  const theme = useTheme();
  return (
    <>
      <Web3Modal
        themeMode={themeToggle as "light" | "dark"}
        themeVariables={{
          "--w3m-accent-color": theme.primaryPurple,
          "--w3m-background-color": theme.primaryPurple,
          "--w3m-overlay-background-color": "rgba(0, 0, 0, 0.6)",
          "--w3m-overlay-backdrop-filter": "blur(3px)",
          "--w3m-logo-image-url": "https://github.com/kleros/kleros-v2/blob/dev/docs/kleros-logo-white.png?raw=true",
          "--w3m-color-bg-1": theme.lightBackground,
        }}
        {...{ projectId, ethereumClient }}
      />
      <WagmiConfig config={wagmiConfig}> {children} </WagmiConfig>
    </>
  );
};

export default Web3Provider;
