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
  42161: "0xE8f028aAc4d4B6A07E62c2C2f7B8818876a0CF2F",
  100: "0x5ACD2B61ad3d25fa3422f29B0636C69c70f6588f",
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
