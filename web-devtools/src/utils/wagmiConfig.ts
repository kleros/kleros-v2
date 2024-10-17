import { type Chain } from "viem";
import { createConfig, fallback, http, webSocket } from "wagmi";
import { mainnet, arbitrumSepolia, arbitrum, gnosisChiado } from "wagmi/chains";

import { ALL_CHAINS } from "consts/chains";
import { isProductionDeployment } from "consts/index";

const chains = ALL_CHAINS as [Chain, ...Chain[]];

export const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

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

export const wagmiConfig = createConfig({
  chains: chains,
  transports: transports,
});
