import { fallback, http, webSocket } from "viem";
import { getEnvConfig } from "../config.ts";
import { arbitrum, arbitrumSepolia } from "viem/chains";

// https://github.com/alchemyplatform/alchemy-sdk-js/blob/c4440cb/src/types/types.ts#L98-L153
const alchemyToViemChain: Record<number, string> = {
  [arbitrumSepolia.id]: "arb-sepolia",
  [arbitrum.id]: "arb-mainnet",
};

type AlchemyProtocol = "https" | "wss";

// https://github.com/alchemyplatform/alchemy-sdk-js/blob/c4440cb/src/util/const.ts#L16-L18
function getAlchemyRpcUrl(protocol: AlchemyProtocol, chainId: number): string {
  const network = alchemyToViemChain[chainId];
  if (!network) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  const config = getEnvConfig();
  return `${protocol}://${network}.g.alchemy.com/v2/${config.alchemyApiKey}`;
}

export const alchemyTransport = (chain: number) =>
  fallback([http(getAlchemyRpcUrl("https", chain)), webSocket(getAlchemyRpcUrl("wss", chain))]);
