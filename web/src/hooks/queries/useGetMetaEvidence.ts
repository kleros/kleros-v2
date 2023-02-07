import useSWRImmutable from "swr/immutable";
// import { utils } from "ethers";
import { useConnectedContract } from "hooks/useConnectedContract";

export const useGetMetaEvidence = (
  disputeID?: string,
  arbitrableAddress?: string
) => {
  // const formattedAddress = arbitrableAddress
  //   ? utils.getAddress(arbitrableAddress)
  //   : undefined;
  const arbitrable = useConnectedContract(
    "IMetaEvidence",
    "0x4d18b9792e0D8F5aF696E71dBEDff8fcBEed6e8C",
    10200
  );
  return useSWRImmutable(
    () => (arbitrable ? `MetaEvidence${disputeID}${arbitrableAddress}` : false),
    async () => {
      if (arbitrable) {
        const disputeFilter = arbitrable.filters.Dispute(null, disputeID);
        const disputeEvents = await arbitrable.queryFilter(disputeFilter);
        const metaEvidenceFilter = arbitrable.filters.MetaEvidence(
          disputeEvents[0].args?._metaEvidenceID
        );
        const metaEvidenceEvents = await arbitrable.queryFilter(
          metaEvidenceFilter
        );
        return fetch(
          `https://cloudflare-ipfs.com${metaEvidenceEvents[0].args?._evidence}`
        ).then((res) => res.json());
      } else throw Error;
    }
  );
};
