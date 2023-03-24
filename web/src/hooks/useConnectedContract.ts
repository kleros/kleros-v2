import { JsonRpcProvider } from "@ethersproject/providers";
import { useSigner } from "wagmi";
import { getContract, ContractName } from "utils/getContract";
import { QUERY_CHAINS } from "consts/chains";

export type { ContractName };

export const useConnectedContract = (
  contractName: ContractName,
  contractAddress?: string,
  chain?: number
) => {
  const contract = getContract(contractName, contractAddress);
  const { data: signer } = useSigner();
  if (signer && !chain) {
    const connectedContract = contract?.connect(signer);
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
