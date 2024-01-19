import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { getPublicClient } from "wagmi/dist/actions";

export const validateAddress = async (address: string): Promise<boolean> => {
  try {
    if (isAddress(address)) return true;

    const publicClient = getPublicClient({ chainId: 1 });
    const isValidEns = (await publicClient.getEnsAddress({ name: normalize(address) })) !== null;

    return isValidEns;
  } catch {
    return false;
  }
};
