import { useConnectedContract, ContractName } from "./useConnectedContract";

export const useContractCall = (
  contractName: ContractName,
  methodName: string,
  chainId?: number
) => {
  const connectedContract = useConnectedContract(contractName, chainId);
  if (connectedContract) {
    return { call: connectedContract[methodName] };
  }
  return undefined;
};
