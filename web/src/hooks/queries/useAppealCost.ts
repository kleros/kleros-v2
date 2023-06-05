import useSWRImmutable from "swr/immutable";
import { BigNumber } from "ethers";
import { useKlerosCore } from "hooks/contracts/generated";

export const useAppealCost = (disputeID?: string) => {
  const klerosCore = useKlerosCore();
  return useSWRImmutable(
    () => (klerosCore && disputeID ? `AppealCost${disputeID}` : false),
    async () => {
      if (!klerosCore || typeof disputeID === "undefined") return;
      return await klerosCore.appealCost(BigNumber.from(disputeID));
    }
  );
};
