import useSWRImmutable from "swr/immutable";
// import { utils } from "ethers";
import { BigNumber } from "ethers";
import { useProvider } from "wagmi";
import { useIMetaEvidence } from "hooks/contracts/generated";

export const useEvidenceGroup = (
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
    () =>
      arbitrable ? `EvidenceGroup${disputeID}${arbitrableAddress}` : false,
    async () => {
      if (arbitrable) {
        const disputeFilter = arbitrable.filters.Dispute(
          null,
          BigNumber.from(parseInt(disputeID!) + 1),
          null,
          null
        );
        const disputeEvents = await arbitrable.queryFilter(disputeFilter);
        return disputeEvents[0].args?._evidenceGroupID.toString();
      } else throw Error;
    }
  );
};
