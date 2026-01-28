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
import { fallback, http, webSocket } from "wagmi";

import { DEFAULT_CHAIN } from "consts/chains";

import { HARDHAT_NODE_RPC, isLocalDeployment, isProductionDeployment } from "src/consts";

const alchemyApiKey = import.meta.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  throw new Error("Alchemy API key is not set in ALCHEMY_API_KEY environment variable.");
}

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

export const alchemyTransport = (chain: AppKitNetwork) =>
  fallback([http(alchemyURL("https", chain.id)), webSocket(alchemyURL("wss", chain.id))]);
export const defaultTransport = (chain: AppKitNetwork) =>
  fallback([http(chain.rpcUrls.default?.http?.[0]), webSocket(chain.rpcUrls.default?.webSocket?.[0])]);

export const getChainRpcUrl = (protocol: AlchemyProtocol, chainId: number | string) => {
  return alchemyURL(protocol, chainId);
};

export const getDefaultChainRpcUrl = (protocol: AlchemyProtocol) => {
  return getChainRpcUrl(protocol, DEFAULT_CHAIN.id);
};

const isProduction = isProductionDeployment();
const isLocalhost = isLocalDeployment();

const getTransports = () => {
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

export const transports = getTransports();
