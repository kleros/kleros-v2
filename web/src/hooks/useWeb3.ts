import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

export const useWeb3 = () => useWeb3React<Web3Provider>();
