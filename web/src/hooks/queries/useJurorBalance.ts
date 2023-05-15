import { KlerosCore } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/KlerosCore";
import useSWR from "swr";
import { useConnectedContract } from "../useConnectedContract";

export const useJurorBalance = (user?: string | null, courtId?: string | undefined) => {
  const klerosCore = useConnectedContract("KlerosCore") as KlerosCore;
  return useSWR(
    () => (klerosCore && user && courtId ? `JurorBalance${user}${courtId}` : false),
    async () => {
      if (klerosCore && user && courtId) {
        return await klerosCore.getJurorBalance(user, courtId);
      } else {
        return undefined;
      }
    }
  );
};
