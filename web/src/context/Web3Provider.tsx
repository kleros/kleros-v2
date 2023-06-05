import React from "react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { arbitrumGoerli, gnosisChiado } from "wagmi/chains";

const chains = [arbitrumGoerli, gnosisChiado];
const projectId = "6efaa26765fa742153baf9281e218217";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <>
    <WagmiConfig config={wagmiConfig}> {children} </WagmiConfig>
    <Web3Modal {...{ projectId, ethereumClient }} />
  </>
);

export default Web3Provider;
