import { useCallback } from "react";

import { encodeFunctionData, type SimulateContractParameters } from "viem";

import { isUndefined } from "src/utils";

import { useSimulateTransactionBatcherBatchSend, useWriteTransactionBatcherBatchSend } from "./contracts/generated";

export type TransactionBatcherConfig = SimulateContractParameters[];

/**
 * @param configs SimulateContractParameters[] - an array of useWriteContract Parameters
 * @description This takes in multiple write calls and batches them into a single transaction
 * @example useTransactionBatcher([
 *                 { address : "contract one address",
 *                   abi : "contract one abi",
 *                   functionName : "...",
 *                   args: [...]
 *                   value: 0
 *                 },
 *                 { address : "contract 2 address",
 *                   abi : "contract 2 abi",
 *                   functionName : "...",
 *                   args: [...]
 *                   value: 0
 *                 },
 *                ])
 */
const useTransactionBatcher = (configs?: TransactionBatcherConfig) => {
  const validatedConfigs = configs ?? [];
  const {
    data: batchConfig,
    isLoading,
    isError,
  } = useSimulateTransactionBatcherBatchSend({
    query: {
      enabled: !isUndefined(configs),
    },
    args: [
      validatedConfigs.map((config) => config?.address),
      validatedConfigs.map((config) => config?.value ?? BigInt(0)),
      validatedConfigs.map((config) => encodeFunctionData(config)),
    ],
  });
  const { writeContractAsync } = useWriteTransactionBatcherBatchSend();

  const executeBatch = useCallback(() => writeContractAsync(batchConfig.request), [batchConfig, writeContractAsync]);
  return { executeBatch, batchConfig, isError, isLoading };
};

export default useTransactionBatcher;
