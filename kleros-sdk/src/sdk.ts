import { createPublicClient, webSocket } from "viem";
import { arbitrumSepolia } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();
let ALCHEMY_API_KEY: string | undefined = process.env.ALCHEMY_API_KEY;
let transport;
let publicClient;

export const configureSDK = (config: { apiKey?: string }) => {
  if (config.apiKey) {
    ALCHEMY_API_KEY = config.apiKey;
    transport = webSocket(`wss://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport,
    });
  }
};

export const getPublicClient = () => {
  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }
  return publicClient;
};
