import { PublicClient, isAddress } from "viem";
import { normalize } from "viem/ens";

export const validateAddress = async (address: string, publicClient: PublicClient): Promise<boolean> => {
  try {
    if (isAddress(address)) return true;

    const isValidEns = (await publicClient.getEnsAddress({ name: normalize(address) })) !== null;

    return isValidEns;
  } catch {
    return false;
  }
};
