import { utils } from "ethers";
import { useEthers, Chain } from "@usedapp/core";
import { useAddNetwork } from "./useAddNetwork";

export const useSwitchNetwork = () => {
  const { library } = useEthers();
  const addNetwork = useAddNetwork();

  const switchNetwork = async (chain: Chain) => {
    if (library) {
      await library
        .send("wallet_switchEthereumChain", [
          { chainId: utils.hexValue(chain.chainId) },
        ])
        .catch(async (error: any) => {
          if (error.code === 4902 || error.code === -1) {
            await addNetwork(chain);
            await switchNetwork(chain);
          } else if (error.code !== 1013) {
            console.error(error);
            throw error;
          }
        });
    } else console.error("No provider detected");
  };

  return switchNetwork;
};
