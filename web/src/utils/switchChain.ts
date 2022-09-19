import { injected } from "connectors/injected";
import { SUPPORTED_CHAINS } from "consts/supportedChains";

const NOT_ADDED_CHAIN_CODE = 4902;

export const switchChain = async (chainId: keyof typeof SUPPORTED_CHAINS) => {
  const provider = await injected.getProvider();
  try {
    await _switchChain(provider, chainId);
  } catch (switchError) {
    if (switchError.code === NOT_ADDED_CHAIN_CODE) {
      await addChain(provider, SUPPORTED_CHAINS[chainId.toString()]);
    } else throw switchError;
  }
};

type Chain = {
  chainId: number;
  chainName: string;
  nativeCurrency: string;
  rpcUrls: string;
  blockExplorerUrls: string;
};

const addChain = async (
  provider: any,
  { chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls }: Chain
) => {
  return await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0x" + chainId.toString(16),
        chainName: chainName,
        nativeCurrency: nativeCurrency,
        rpcUrls: rpcUrls,
        blockExplorerUrls: blockExplorerUrls,
      },
    ],
  });
};

const _switchChain = async (
  provider: any,
  chainId: keyof typeof SUPPORTED_CHAINS
) => {
  return await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x" + chainId.toString(16) }],
  });
};
