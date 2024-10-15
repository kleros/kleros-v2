import { createPublicClient, type PublicClient } from "viem";
import { SdkConfig } from "./types";

let publicClient: PublicClient | undefined;

export const configureSDK = (config: SdkConfig) => {
  if (config.client) {
    publicClient = createPublicClient(config.client);
  }
};

export const getPublicClient = (): PublicClient | undefined => {
  if (!publicClient) {
    throw new Error("SDK not configured. Please call `configureSDK` before using.");
  }
  return publicClient;
};
