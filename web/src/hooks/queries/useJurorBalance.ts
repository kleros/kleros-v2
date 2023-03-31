import useSWR from "swr";
import { BigNumber } from "ethers";
import { useProvider } from "wagmi";
import { useKlerosCore } from "hooks/contracts/generated";

export const useJurorBalance = (
  user?: `0x${string}` | null,
  courtId?: string | undefined
) => {
  const provider = useProvider();
  const klerosCore = useKlerosCore({ signerOrProvider: provider });
  return useSWR(
    () =>
      klerosCore && user && courtId ? `JurorBalance{address}{courtId}` : false,
    async () => {
      if (klerosCore && user && courtId) {
        return await klerosCore.getJurorBalance(user, BigNumber.from(courtId));
      } else {
        return undefined;
      }
    }
  );
};
