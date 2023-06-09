import useSWRImmutable from "swr/immutable";
import { getIMetaEvidence, iMetaEvidenceABI } from "hooks/contracts/generated";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";

export const useEvidenceGroup = (disputeID?: string, arbitrableAddress?: string) => {
  // const formattedAddress = arbitrableAddress
  //   ? utils.getAddress(arbitrableAddress)
  //   : undefined;
  const publicClient = usePublicClient();

  const arbitrable = getIMetaEvidence({
    address: "0xc0fcc96BFd78e36550FCaB434A9EE1210B57225b",
  });
  console.log("🚀 ~ file: useEvidenceGroup.ts:14 ~ useEvidenceGroup ~ arbitrable:", arbitrable);
  console.log("_disputeID", disputeID);

  return useSWRImmutable(
    () => (arbitrable ? `EvidenceGroup${disputeID}${arbitrableAddress}` : false),
    async () => {
      if (arbitrable) {
        const disputeFilter = await arbitrable.createEventFilter.Dispute({
          _disputeID: BigInt(parseInt(disputeID!) + 1),
        });
        // const disputeFilter = await publicClient.createContractEventFilter({
        //   abi: iMetaEvidenceABI,
        //   address: "0xc0fcc96BFd78e36550FCaB434A9EE1210B57225b",
        //   eventName: "Dispute",
        //   args: {
        //     _disputeID: BigInt(parseInt(disputeID!) + 1),
        //   },
        // });
        // const disputeFilter = await publicClient.createEventFilter({
        //   address: "0xc0fcc96BFd78e36550FCaB434A9EE1210B57225b",
        //   event: parseAbiItem('event Dispute(IArbitrator indexed _arbitrator, uint256 indexed _disputeID, uint256 _metaEvidenceID, uint256 _evidenceGroupID)'),
        //   args:{_disputeId: BigInt(parseInt(disputeID!) + 1)
        //   }
        // });

        const disputeEvents = await publicClient.getFilterLogs({
          filter: disputeFilter,
        });
        return disputeEvents[0];
      } else throw Error;
    }
  );
};
