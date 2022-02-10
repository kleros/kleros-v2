import { useContractFunction as _useContractFunction } from "@usedapp/core";
import { getContract, ContractName } from "../utils/getContract";

export const useContractFunction = (
  contractName: ContractName,
  functionName: string
) => {
  const contract = getContract(contractName);
  return _useContractFunction(contract, functionName);
};
