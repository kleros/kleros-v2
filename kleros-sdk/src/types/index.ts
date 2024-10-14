import { PublicClientConfig } from "viem";

export type SdkConfig = {
  client: PublicClientConfig;
};

type GetDisputeParametersOptions = {
  sdkConfig: SdkConfig;
  additionalContext: Record<string, any>;
};

export type GetDisputeParameters = {
  disputeId: number;
  coreSubgraph: string;
  dtrSubgraph: string;
  options: GetDisputeParametersOptions | undefined;
};
