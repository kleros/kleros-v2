import useSWR from "swr";
import { PNK } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/mock/PNK";
import { useConnectedContract } from "hooks/useConnectedContract";

export const usePNKBalance = (user?: string | null) => {
  const pnkContract = useConnectedContract("PNK") as PNK;
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
