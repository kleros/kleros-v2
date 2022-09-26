import { useWeb3 } from "hooks/useWeb3";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getContract, ContractName } from "utils/getContract";

export type { ContractName };

export const useConnectedContract = (
  contractName: ContractName,
  contractAddress?: string
  // chainId?: number
) => {
  const { library } = useWeb3();
  const contract = getContract(contractName, contractAddress);
  if (library) {
    const connectedContract = contract?.connect(library);
    return connectedContract;
    // } else if (chainId && readOnlyUrls && readOnlyUrls[chainId]) {
    //   const provider = new JsonRpcProvider(readOnlyUrls[chainId]);
    //   const connectedContract = contract.connect(provider);
    //   return connectedContract;
  } else {
    console.error("No Web3 provider detected.");
    return undefined;
  }
};
