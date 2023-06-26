import useSWRImmutable from "swr/immutable";
import { getIArbitrableV2 } from "hooks/contracts/generated";
import { usePublicClient } from "wagmi";

export const useEvidenceGroup = (disputeID?: string, arbitrableAddress?: string) => {
  // const formattedAddress = arbitrableAddress
  //   ? utils.getAddress(arbitrableAddress)
  //   : undefined;
  const publicClient = usePublicClient();

  const arbitrable = getIArbitrableV2({
    address: "0xc0fcc96BFd78e36550FCaB434A9EE1210B57225b",
  });

  return useSWRImmutable(
    () => (arbitrable ? `EvidenceGroup${disputeID}${arbitrableAddress}` : false),
    async () => {
      if (arbitrable) {
        const disputeFilter = await arbitrable.createEventFilter.DisputeTemplate({
          _templateId: BigInt(parseInt(disputeID!) + 1),
        });

        const disputeEvents = await publicClient.getFilterLogs({
          filter: disputeFilter,
        });

        return disputeEvents[0];
      } else throw Error;
    }
  );
};
