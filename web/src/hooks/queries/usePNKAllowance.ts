import useSWR from "swr";
import { PNK } from "@kleros/kleros-v2-contracts/typechain-types/src/token/PNK";
import { useConnectedContract } from "hooks/useConnectedContract";
import { CONTRACTS } from "utils/getContract";

export const usePNKAllowance = (user?: string | null) => {
  const pnkContract = useConnectedContract("PNK") as PNK;
  return useSWR(
    () => (pnkContract && user ? `PNKAllowance${user}` : false),
    async () => {
      if (pnkContract && user) {
        return await pnkContract.allowance(user, CONTRACTS["KlerosCore"].address);
      } else {
        return undefined;
      }
    }
  );
};
