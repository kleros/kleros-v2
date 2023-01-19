import useSWR from "swr";
import { PNK } from "@kleros/kleros-v2-contracts/typechain-types/src/arbitration/mock/PNK";
import { useConnectedContract } from "hooks/useConnectedContract";
import { CONTRACTS } from "utils/getContract";

export const usePNKAllowance = (user?: string | null) => {
  const pnkContract = useConnectedContract("PNK") as PNK;
  return useSWR(
    () => (pnkContract && user ? `PNKBalance${user}` : false),
    async () => {
      console.log("allowance query");
      if (pnkContract && user) {
        return await pnkContract.allowance(user, CONTRACTS["PNK"].address);
      } else {
        return undefined;
      }
    }
  );
};
