import { useConnectedContract, ContractName } from "./useConnectedContract";
import { Result } from "@ethersproject/abi";

export const useContractCall = (
  contractName: ContractName,
  methodName: string,
  chainId?: number
): { call: (...args: any[]) => Promise<Result> } | undefined => {
  const connectedContract = useConnectedContract(contractName, chainId);
  if (connectedContract) {
    return { call: connectedContract[methodName] };
  }
  return undefined;
};
