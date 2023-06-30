import useSWRImmutable from "swr/immutable";
import { getIArbitrableV2 } from "hooks/contracts/generated";
import { usePublicClient } from "wagmi";
import { isUndefined } from "utils/index";

export const useEvidenceGroup = (disputeID?: string, arbitrableAddress?: `0x${string}`) => {
  const publicClient = usePublicClient();
  return useSWRImmutable(
    () => (arbitrableAddress ? `EvidenceGroup${disputeID}${arbitrableAddress}` : false),
    async () => {
      if (arbitrableAddress && !isUndefined(disputeID)) {
        const arbitrable = getIArbitrableV2({
          address: arbitrableAddress,
        });
        const disputeFilter = await arbitrable.createEventFilter.DisputeTemplate(
          {
            _templateId: BigInt(disputeID),
          },
          {
            fromBlock: 27808516n,
            toBlock: "latest",
          }
        );

        const disputeEvents = await publicClient.getFilterLogs({
          filter: disputeFilter,
        });

        return disputeEvents[0];
      } else throw Error;
    }
  );
};
