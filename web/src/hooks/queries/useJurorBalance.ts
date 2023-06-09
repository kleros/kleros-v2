import useSWR from "swr";
import { getKlerosCore } from "hooks/contracts/generated";

export const useJurorBalance = (user?: `0x${string}` | null, courtId?: string | undefined) => {
  const klerosCore = getKlerosCore({});
  return useSWR(
    () => (klerosCore && user && courtId ? `JurorBalance${user}${courtId}` : false),
    async () => {
      if (klerosCore && user && courtId) {
        return await klerosCore.read.getJurorBalance([user, BigInt(courtId)]);
      } else {
        return undefined;
      }
    }
  );
};
