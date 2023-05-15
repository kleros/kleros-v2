import { useConnectedContract } from "hooks/useConnectedContract";
import useSWRImmutable from "swr/immutable";

export const useAppealCost = (disputeID?: string) => {
  const KlerosCore = useConnectedContract("KlerosCore");
  return useSWRImmutable(
    () => (KlerosCore ? `AppealCost${disputeID}` : false),
    async () => {
      if (!KlerosCore) return;
      return KlerosCore.appealCost(disputeID);
    }
  );
};
