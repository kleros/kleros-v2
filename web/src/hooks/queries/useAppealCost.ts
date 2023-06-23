import useSWRImmutable from "swr/immutable";
import { getKlerosCore } from "hooks/contracts/generated";

export const useAppealCost = (disputeID?: string) => {
  const klerosCore = getKlerosCore({});
  return useSWRImmutable(
    () => (klerosCore && disputeID ? `AppealCost${disputeID}` : false),
    async () => {
      if (!klerosCore || typeof disputeID === "undefined") return;
      return await klerosCore.read.appealCost([BigInt(disputeID)]);
    }
  );
};
