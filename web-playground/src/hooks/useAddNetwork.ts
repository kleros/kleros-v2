import { utils } from "ethers";
import { useEthers, Chain } from "@usedapp/core";
import { NETWORKS } from "../constants/chains";

export const useAddNetwork = () => {
  const { library } = useEthers();

  return async (chain: Chain) => {
    if (library) {
      await library
        .send("wallet_addEthereumChain", [
          {
            chainId: utils.hexValue(chain.chainId),
            chainName: chain.chainName,
            nativeCurrency: NETWORKS[chain.chainId].nativeCurrency,
            rpcUrls: NETWORKS[chain.chainId].rpc,
            blockExplorerUrls: [NETWORKS[chain.chainId].explorers[0].url],
          },
        ])
        .catch((error: any) => {
          console.error(error);
          throw error;
        });
    } else console.error("No provider detected");
  };
};
