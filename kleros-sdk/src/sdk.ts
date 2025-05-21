import { createPublicClient, type PublicClient, type Transport, type Chain } from "viem";
import { SdkConfig } from "./types";
import { SdkNotConfiguredError } from "./errors";

let publicClient: PublicClient<Transport, Chain> | undefined;

/**
 * Configures the Kleros SDK with necessary parameters, primarily the Viem Public Client.
 * This function must be called before any other SDK functions that interact with the blockchain.
 *
 * @param {SdkConfig} config - The configuration object for the SDK.
 * @param {PublicClient} config.client - An instance of Viem's PublicClient.
 *                                       This client is used for all blockchain interactions.
 *                                       It's recommended to use `createPublicClient` from `viem`
 *                                       to construct this client, configured with your desired
 *                                       chain and transport (e.g., HTTP RPC URL).
 *
 * @example
 * import { configureSDK } from '@kleros/kleros-sdk';
 * import { createPublicClient, http } from 'viem';
 * import { mainnet } from 'viem/chains';
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'),
 * });
 *
 * configureSDK({ client });
 */
export const configureSDK = (config: SdkConfig) => {
  if (config.client) {
    // Type assertion to satisfy the more specific type of publicClient
    publicClient = config.client as PublicClient<Transport, Chain>;
  }
};

/**
 * Retrieves the configured Viem PublicClient instance.
 * This client is used by the SDK for blockchain interactions.
 *
 * @returns {PublicClient<Transport, Chain>} The configured Viem PublicClient instance.
 * @throws {SdkNotConfiguredError} If the SDK has not been configured via `configureSDK` prior to calling this function.
 *
 * @example
 * import { getPublicClient, SdkNotConfiguredError } from '@kleros/kleros-sdk';
 *
 * try {
 *   const client = getPublicClient();
 *   // Now you can use the client for direct Viem calls if needed,
 *   // or rest assured that SDK functions will use this client.
 * } catch (error) {
 *   if (error instanceof SdkNotConfiguredError) {
 *     console.error("SDK not configured. Please call configureSDK first.");
 *   } else {
 *     console.error("An unexpected error occurred:", error);
 *   }
 * }
 */
export const getPublicClient = (): PublicClient<Transport, Chain> => {
  if (!publicClient) {
    throw new SdkNotConfiguredError();
  }
  return publicClient;
};
