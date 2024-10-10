import { createPublicClient, webSocket, type PublicClient } from "viem";
import { arbitrumSepolia } from "viem/chains";

let publicClient: PublicClient | undefined;

export const configureSDK = (config: { apiKey?: string }) => {
  if (config.apiKey) {
    const ALCHEMY_API_KEY = config.apiKey;
    const transport = webSocket(`wss://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport,
    });
  }
};

export const getPublicClient = (): PublicClient => {
  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }
  return publicClient;
};
