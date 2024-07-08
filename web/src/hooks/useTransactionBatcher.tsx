import { encodeFunctionData, type SimulateContractParameters } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { createUseSimulateContract, createUseWriteContract } from "wagmi/codegen";

import { DEFAULT_CHAIN } from "consts/chains";

import { isUndefined } from "src/utils";

const batcherAbi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "targets",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
      {
        internalType: "bytes[]",
        name: "datas",
        type: "bytes[]",
      },
    ],
    name: "batchSend",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const useBatchSimulate = createUseSimulateContract({
  abi: batcherAbi,
  functionName: "batchSend",
});

export const useBatchWrite = createUseWriteContract({
  abi: batcherAbi,
  functionName: "batchSend",
});

const batcherAddress = {
  421614: "0xe8061d185D865ce2B2FbCfDa628b5F147d8eB8Ab",
};

export type TransactionBatcherConfig = SimulateContractParameters[];

const useTransactionBatcher = (configs?: TransactionBatcherConfig) => {
  const { chainId } = useAccount();

  const validConfigs = configs ?? [];
  const {
    data: batchConfig,
    isLoading,
    isError,
  } = useBatchSimulate({
    query: {
      enabled: !isUndefined(configs),
    },
    address: batcherAddress[chainId ?? DEFAULT_CHAIN],
    args: [
      validConfigs.map((config) => config?.address),
      validConfigs.map((config) => config?.value ?? BigInt(0)),
      validConfigs.map((config) => encodeFunctionData(config)),
    ],
  });
  const { writeContractAsync } = useWriteContract();

  const executeBatch = () => batchConfig && writeContractAsync(batchConfig.request);
  return { executeBatch, batchConfig, isError, isLoading };
};

export default useTransactionBatcher;
