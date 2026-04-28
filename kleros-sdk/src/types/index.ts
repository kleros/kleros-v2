import { PublicClientConfig } from "viem";

export type SdkConfig = {
  client: PublicClientConfig;
};

type GetDisputeParametersOptions = {
  sdkConfig?: SdkConfig;
  additionalContext?: Record<string, unknown>;
};

export type GetDisputeParameters = {
  disputeId: bigint;
  coreSubgraph: string;
  dtrSubgraph: string;
  options?: GetDisputeParametersOptions;
};
