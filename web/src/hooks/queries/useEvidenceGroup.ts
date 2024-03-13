import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";

import { GENESIS_BLOCK_ARBSEPOLIA } from "consts/index";
import { getIArbitrableV2 } from "hooks/contracts/generated";
import { isUndefined } from "utils/index";

export const useEvidenceGroup = (disputeID?: string, arbitrableAddress?: `0x${string}`) => {
  const isEnabled = !isUndefined(arbitrableAddress);
  const publicClient = usePublicClient();
  return useQuery({
    queryKey: [`EvidenceGroup${disputeID}${arbitrableAddress}`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      if (arbitrableAddress && !isUndefined(disputeID)) {
        const arbitrable = getIArbitrableV2({
          address: arbitrableAddress,
        });
        const disputeFilter = await arbitrable.createEventFilter.DisputeRequest(
          {
            _arbitrableDisputeID: BigInt(disputeID),
          },
          {
            fromBlock: GENESIS_BLOCK_ARBSEPOLIA,
            toBlock: "latest",
          }
        );

        const disputeEvents = await publicClient.getFilterLogs({
          filter: disputeFilter,
        });

        return disputeEvents[0].args._externalDisputeID;
      } else throw Error;
    },
  });
};
