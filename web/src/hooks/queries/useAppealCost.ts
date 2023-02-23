import useSWRImmutable from "swr/immutable";
import { useConnectedContract } from "hooks/useConnectedContract";

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
