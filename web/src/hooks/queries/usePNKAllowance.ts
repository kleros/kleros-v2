import { useQuery } from "@tanstack/react-query";
import { getPnk, getKlerosCore } from "hooks/contracts/generated";

export const usePNKAllowance = (user?: `0x${string}` | null) => {
  const pnkContract = getPnk({});
  const klerosCore = getKlerosCore({});
  const isEnabled = user !== undefined;

  return useQuery({
    queryKey: ["refetchOnBlock", `pnkAllowance${user}`],
    enabled: isEnabled,
    queryFn: async () => {
      if (pnkContract && user && klerosCore) {
        return await pnkContract.read.allowance([user, klerosCore.address]);
      } else {
        return undefined;
      }
    },
  });
};
