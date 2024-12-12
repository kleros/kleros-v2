import { type UseSimulateContractReturnType } from "wagmi";

type ExtendedWagmiError = UseSimulateContractReturnType["error"] & { shortMessage?: string; metaMessages?: string[] };

/**
 * @param error
 * @description Tries to extract the human readable error message, otherwise reverts to error.message
 * @returns Human readable error if possible
 */
export const parseWagmiError = (error: UseSimulateContractReturnType["error"]) => {
  if (!error) return "";
  const extError = error as ExtendedWagmiError;

  const metaMessage = extError?.metaMessages?.[0];
  const shortMessage = extError?.shortMessage;

  return metaMessage ?? shortMessage ?? error.message;
};
