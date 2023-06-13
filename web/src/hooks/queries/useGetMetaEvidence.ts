import useSWRImmutable from "swr/immutable";
import { usePublicClient } from "wagmi";
import { getIMetaEvidence } from "hooks/contracts/generated";

export const useGetMetaEvidence = (disputeID?: string, arbitrableAddress?: string) => {
  // const formattedAddress = arbitrableAddress
  //   ? utils.getAddress(arbitrableAddress)
  //   : undefined;
  const publicClient = usePublicClient();
  const arbitrable = getIMetaEvidence({
    address: "0xc0fcc96BFd78e36550FCaB434A9EE1210B57225b",
  });
  return useSWRImmutable(
    () => (arbitrable ? `MetaEvidence${disputeID}${arbitrableAddress}` : false),
    async () => {
      if (arbitrable && typeof disputeID !== "undefined") {
        const disputeFilter = await arbitrable.createEventFilter.Dispute({
          _disputeID: BigInt(parseInt(disputeID) + 1),
        });
        const disputeEvents = await publicClient.getFilterLogs({
          filter: disputeFilter,
        });
        const metaEvidenceFilter = await arbitrable.createEventFilter.MetaEvidence({
          _metaEvidenceID: disputeEvents[0].args._metaEvidenceID,
        });
        const metaEvidenceEvents = await publicClient.getFilterLogs({
          filter: metaEvidenceFilter,
        });
        return fetch(`https://cloudflare-ipfs.com${metaEvidenceEvents[0].args?._evidence}`).then((res) => res.json());
      } else throw Error;
    }
  );
};
