import React from "react";
import { EthereumClient } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { createConfig, fallback, http, WagmiProvider, webSocket } from "wagmi";
import { mainnet, arbitrumSepolia, gnosisChiado } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";
import { useToggleTheme } from "hooks/useToggleThemeContext";
import { useTheme } from "styled-components";

const projectId = process.env.WALLETCONNECT_PROJECT_ID ?? "6efaa26765fa742153baf9281e218217";
const alchemyKey = process.env.ALCHEMY_API_KEY ?? "";

type AlchemyProtocol = "https" | "wss";
type AlchemyChain = "arb-sepolia" | "eth-mainnet";
const alchemyURL = (protocol: AlchemyProtocol, chain: AlchemyChain) =>
  `${protocol}://${chain}.g.alchemy.com/v2/${alchemyKey}`;
const alchemyTransport = (chain: AlchemyChain) =>
  fallback([webSocket(alchemyURL("wss", chain)), http(alchemyURL("https", chain))]);

const chains = [arbitrumSepolia, mainnet, gnosisChiado];
const wagmiConfig = createConfig({
  chains: [arbitrumSepolia, mainnet, gnosisChiado],
  transports: {
    [arbitrumSepolia.id]: alchemyTransport("arb-sepolia"),
    [mainnet.id]: alchemyTransport("eth-mainnet"),
    [gnosisChiado.id]: fallback([webSocket("wss://rpc.chiadochain.net/wss"), http("https://rpc.chiadochain.net")]),
  },
  connectors: [walletConnect({ projectId })],
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
        }}
        {...{ projectId, ethereumClient }}
      />
      <WagmiProvider config={wagmiConfig}> {children} </WagmiProvider>
    </>
  );
};

export default Web3Provider;
