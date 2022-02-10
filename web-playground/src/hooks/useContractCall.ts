import { useEthers } from "@usedapp/core";
import { getContract, ContractName } from "../utils/getContract";

export const useContractCall = (
  contractName: ContractName,
  methodName: string
) => {
  const { library } = useEthers();
  const contract = getContract(contractName);
  if (library) {
    const connectedContract = contract.connect(library);
    return { call: connectedContract[methodName] };
  }
  return undefined;
};
