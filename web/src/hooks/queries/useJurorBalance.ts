import { useQuery } from "@tanstack/react-query";
import { getKlerosCore } from "hooks/contracts/generated";

export const useJurorBalance = (user?: `0x${string}` | null, courtId?: string | undefined) => {
  const klerosCore = getKlerosCore({});

  const isEnabled = !!(klerosCore && user && courtId);

  return useQuery({
    queryKey: [`JurorBalance${user}${courtId}`],
    enabled: isEnabled,
    queryFn: async () => {
      if (isEnabled) {
        return await klerosCore.read.getJurorBalance([user, BigInt(courtId)]);
      }
      return undefined;
    },
  });
};
