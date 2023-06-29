import React from "react";
import { EthereumClient, w3mConnectors } from "@web3modal/ethereum";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { arbitrumGoerli, gnosisChiado } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const chains = [arbitrumGoerli, gnosisChiado];
const projectId = process.env.WALLETCONNECT_PROJECT_ID ?? "6efaa26765fa742153baf9281e218217";

const { publicClient } = configureChains(chains, [
  alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY ?? "" }),
  jsonRpcProvider({
    rpc: () => ({
      http: `https://rpc.chiadochain.net`,
      webSocket: `wss://rpc.chiadochain.net/wss	`,
    }),
  }),
]);

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <WagmiConfig config={wagmiConfig}> {children} </WagmiConfig>
    <Web3Modal {...{ projectId, ethereumClient }} />
  </>
);

export default Web3Provider;
