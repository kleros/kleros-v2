import { useEthers, useConfig } from "@usedapp/core";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getContract, ContractName } from "../utils/getContract";

export type { ContractName };

export const useConnectedContract = (
  contractName: ContractName,
  chainId?: number
) => {
  const { library, chainId: walletChain } = useEthers();
  const { readOnlyUrls } = useConfig();
  const contract = getContract(contractName);
  if (library && walletChain && walletChain === chainId) {
    const connectedContract = contract.connect(library);
    return connectedContract;
  } else if (chainId && readOnlyUrls && readOnlyUrls[chainId]) {
    const provider = new JsonRpcProvider(readOnlyUrls[chainId]);
    const connectedContract = contract.connect(provider);
    return connectedContract;
  } else {
    console.error("No Web3 provider detected.");
    return undefined;
  }
};
