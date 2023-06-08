import useSWR from "swr";
import { BigNumber } from "ethers";
import { useKlerosCore } from "hooks/contracts/generated";

export const useJurorBalance = (user?: `0x${string}` | null, courtId?: string | undefined) => {
  const klerosCore = useKlerosCore();
  return useSWR(
    () => (klerosCore && user && courtId ? `JurorBalance${user}${courtId}` : false),
    async () => {
      if (klerosCore && user && courtId) {
        return await klerosCore.getJurorBalance(user, BigNumber.from(courtId));
      } else {
        return undefined;
      }
    }
  );
};
