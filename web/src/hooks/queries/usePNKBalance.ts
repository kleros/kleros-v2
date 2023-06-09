import useSWR from "swr";
import { getPnk } from "hooks/contracts/generated";

export const usePNKBalance = (user?: `0x${string}` | null) => {
  const pnkContract = getPnk({});

  return useSWR(
    () => (pnkContract && user ? `PNKBalance${user}` : false),
    async () => {
      if (pnkContract && user) {
        const balance = await pnkContract.read.balanceOf([user]);
        return balance;
      } else {
        return undefined;
      }
    }
  );
};
