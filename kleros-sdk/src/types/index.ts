import type { PublicClient } from "viem";

/**
 * Configuration object for initializing the Kleros SDK.
 */
export type SdkConfig = {
  /**
   * An instance of Viem's `PublicClient`.
   * This client is used for all blockchain interactions by the SDK.
   * It should be configured with the desired chain and transport (e.g., RPC URL).
   * @see https://viem.sh/docs/clients/public.html
   *
   * @example
   * import { createPublicClient, http } from 'viem';
   * import { mainnet } from 'viem/chains';
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'),
   * });
   * const sdkConfig: SdkConfig = { client };
   */
  client: PublicClient;
};

/**
 * Optional parameters for functions like `getDispute`.
 */
type GetDisputeParametersOptions = {
  /**
   * Optional SDK configuration. If not provided, the SDK will attempt to use
   * a globally configured client (via `configureSDK`).
   * This allows for overriding the global configuration for specific calls.
   */
  sdkConfig?: SdkConfig;
  /**
   * Optional additional context to be passed through to data mapping or templating functions.
   * This can be used to provide extra information needed for specific dispute resolution flows.
   */
  additionalContext?: Record<string, any>;
};

/**
 * Parameters required for fetching details of a specific dispute.
 */
export type GetDisputeParameters = {
  /**
   * The unique identifier of the dispute.
   * This is typically a BigInt or a string that can be converted to a BigInt.
   */
  disputeId: bigint;
  /**
   * The GraphQL endpoint URL for the Kleros Core subgraph.
   * This subgraph contains information about disputes, courts, and jurors.
   */
  coreSubgraph: string;
  /**
   * The GraphQL endpoint URL for the Dispute Template Registry (DTR) subgraph.
   * This subgraph is used to fetch dispute templates which define how dispute data is structured and displayed.
   */
  dtrSubgraph: string;
  /**
   * Optional parameters including SDK configuration and additional context.
   */
  options?: GetDisputeParametersOptions;
};
