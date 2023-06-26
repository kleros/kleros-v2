import useSWRImmutable from "swr/immutable";
import { usePublicClient } from "wagmi";
import { getIArbitrableV2 } from "hooks/contracts/generated";

export const useDisputeTemplate = (disputeID?: string, arbitrableAddress?: `0x{string}`) => {
  const publicClient = usePublicClient();
  return useSWRImmutable(
    () => (arbitrableAddress ? `DisputeTemplate${disputeID}${arbitrableAddress}` : false),
    async () => {
      if (arbitrableAddress && typeof disputeID !== "undefined") {
        const arbitrable = getIArbitrableV2({
          address: arbitrableAddress,
        });
        const disputeFilter = await arbitrable.createEventFilter.DisputeRequest(
          {
            _arbitrableDisputeID: BigInt(disputeID),
          },
          {
            fromBlock: 27808516n,
            toBlock: "latest",
          }
        );
        const disputeEvents = await publicClient.getFilterLogs({
          filter: disputeFilter,
        });
        const disputeTemplateFilter = await arbitrable.createEventFilter.DisputeTemplate(
          {
            _templateId: disputeEvents[0].args._templateId,
          },
          {
            fromBlock: 27808516n,
            toBlock: "latest",
          }
        );
        const disputeTemplateEvents = await publicClient.getFilterLogs({
          filter: disputeTemplateFilter,
        });

        if (disputeTemplateEvents) {
          const parsedTemplate = JSON.parse(disputeTemplateEvents[0].args._templateData ?? "");
          return parsedTemplate;
        }
      } else throw Error;
    }
  );
};
