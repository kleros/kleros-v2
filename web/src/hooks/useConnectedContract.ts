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
    const connectedContract = contract?.connect(library.getSigner());
    return connectedContract;
  } else {
    try {
      const provider = new JsonRpcProvider(
        "https://arb-rinkeby.g.alchemy.com/v2/d3zEid5ibv4DysSGiJ3oLnD1uDGd0YtV"
      );
      const connectedContract = contract?.connect(provider);
      return connectedContract;
    } catch (error) {
      console.error("No Web3 provider detected.");
      return undefined;
    }
  }
};
