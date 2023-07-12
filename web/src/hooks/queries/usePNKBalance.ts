import { useQuery } from "@tanstack/react-query";
import { getPnk } from "hooks/contracts/generated";

export const usePNKBalance = (user?: `0x${string}` | null) => {
  const pnkContract = getPnk({});

  const isEnabled = !!(pnkContract && user);

  return useQuery({
    queryKey: [`PNKBalance${user}`],
    enabled: isEnabled,
    queryFn: async () => {
      if (isEnabled) {
        const balance = await pnkContract.read.balanceOf([user]);
        return balance;
      }
      return undefined;
    },
  });
};
