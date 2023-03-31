import React from "react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { arbitrumGoerli, gnosisChiado } from "wagmi/chains";

const chains = [arbitrumGoerli, gnosisChiado];
const projectId = "6efaa26765fa742153baf9281e218217";

const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider,
});

const ethereumClient = new EthereumClient(wagmiClient, chains);

const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <>
    <WagmiConfig client={wagmiClient}> {children} </WagmiConfig>
    <Web3Modal {...{ projectId, ethereumClient }} />
  </>
);

export default Web3Provider;
