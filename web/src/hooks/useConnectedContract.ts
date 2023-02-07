import { useWeb3 } from "hooks/useWeb3";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getContract, ContractName } from "utils/getContract";
import { QUERY_CHAINS } from "consts/chains";

export type { ContractName };

export const useConnectedContract = (
  contractName: ContractName,
  contractAddress?: string,
  chain?: number
) => {
  const { library } = useWeb3();
  const contract = getContract(contractName, contractAddress);
  if (library && !chain) {
    const connectedContract = contract?.connect(library.getSigner());
    return connectedContract;
  } else {
    try {
      const rpcUrl = chain
        ? QUERY_CHAINS[chain].rpcUrls[0]
        : "https://arb-goerli.g.alchemy.com/v2/HAAmSjN1RzxG1LNsGh9Je72bYVPsyFfQ";
      const provider = new JsonRpcProvider(rpcUrl);
      const connectedContract = contract?.connect(provider);
      return connectedContract;
    } catch (error) {
      console.error("No Web3 provider detected.");
      return undefined;
    }
  }
};
