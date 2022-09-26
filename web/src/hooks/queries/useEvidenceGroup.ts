import useSWRImmutable from "swr/immutable";
import { utils } from "ethers";
import { IMetaEvidence } from "@kleros/kleros-v2-contracts/typechain-types/src/evidence/IMetaEvidence";
import { useConnectedContract } from "hooks/useConnectedContract";

export const useEvidenceGroup = (
  disputeID?: string,
  arbitrableAddress?: string
) => {
  const formattedAddress = arbitrableAddress
    ? utils.getAddress(arbitrableAddress)
    : undefined;
  const arbitrable = useConnectedContract(
    "IMetaEvidence",
    formattedAddress
  ) as IMetaEvidence;
  return useSWRImmutable(
    () =>
      arbitrable ? `EvidenceGroup${disputeID}${arbitrableAddress}` : false,
    async () => {
      if (arbitrable) {
        const disputeFilter = arbitrable.filters.Dispute(null, disputeID);
        const disputeEvents = await arbitrable.queryFilter(disputeFilter);
        return disputeEvents[0].args?._evidenceGroupID.toString();
      } else throw Error;
    }
  );
};
