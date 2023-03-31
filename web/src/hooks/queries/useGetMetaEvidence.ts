import useSWRImmutable from "swr/immutable";
// import { utils } from "ethers";
import { BigNumber } from "ethers";
import { useProvider } from "wagmi";
import { useIMetaEvidence } from "hooks/contracts/generated";

export const useGetMetaEvidence = (
  disputeID?: string,
  arbitrableAddress?: string
) => {
  // const formattedAddress = arbitrableAddress
  //   ? utils.getAddress(arbitrableAddress)
  //   : undefined;
  const provider = useProvider({ chainId: 10_200 });
  const arbitrable = useIMetaEvidence({
    address: "0xc0fcc96BFd78e36550FCaB434A9EE1210B57225b",
    signerOrProvider: provider,
  });
  return useSWRImmutable(
    () => (arbitrable ? `MetaEvidence${disputeID}${arbitrableAddress}` : false),
    async () => {
      if (arbitrable && typeof disputeID !== "undefined") {
        const disputeFilter = arbitrable.filters.Dispute(
          null,
          BigNumber.from(parseInt(disputeID) + 1),
          null,
          null
        );
        const disputeEvents = await arbitrable.queryFilter(disputeFilter);
        const metaEvidenceFilter = arbitrable.filters.MetaEvidence(
          disputeEvents[0].args?._metaEvidenceID,
          null
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
