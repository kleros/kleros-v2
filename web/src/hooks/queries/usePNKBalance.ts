import useSWR from "swr";
import { usePnk } from "hooks/contracts/generated";

export const usePNKBalance = (user?: `0x${string}` | null) => {
  const pnkContract = usePnk();
  return useSWR(
    () => (pnkContract && user ? `PNKBalance${user}` : false),
    async () => {
      if (pnkContract && user) {
        const balance = await pnkContract.balanceOf(user);
        return balance;
      } else {
        return undefined;
      }
    }
  );
};
