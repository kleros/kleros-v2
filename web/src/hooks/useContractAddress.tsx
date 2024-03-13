import { Abi, PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import { GetContractArgs, GetContractResult } from "wagmi/actions";

import { getPinakionV2, pinakionV2ABI, getWeth, getPnkFaucet, wethABI, pnkFaucetABI } from "./contracts/generated";
import { klerosCoreABI, getKlerosCore } from "./contracts/generatedProvider";

type Config = Omit<GetContractArgs<Abi, unknown>, "abi" | "address"> & {
  chainId?: any;
};

export const useContractAddress = <TAbi extends Abi>(
  getter: (c: Config) => GetContractResult<TAbi, PublicClient>
): GetContractResult<TAbi, PublicClient> => {
  const publicClient = usePublicClient();
  return getter({ walletClient: publicClient });
};

export const usePNKAddress = () => {
  return useContractAddress<typeof pinakionV2ABI>(getPinakionV2)?.address;
};

export const useWETHAddress = () => {
  return useContractAddress<typeof wethABI>(getWeth)?.address;
};

export const usePNKFaucetAddress = () => {
  return useContractAddress<typeof pnkFaucetABI>(getPnkFaucet)?.address;
};

export const useKlerosCoreAddress = () => {
  return useContractAddress<typeof klerosCoreABI>(getKlerosCore)?.address;
};
