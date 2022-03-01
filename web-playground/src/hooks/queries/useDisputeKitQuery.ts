import { useEffect } from "react";
import { ArbitrumRinkeby } from "@usedapp/core";
import { useQuery, useQueryClient } from "react-query";
import { BigNumber } from "ethers";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export interface IDisputeKitEvidence {
  core: string;
  evidenceGroupID: BigNumber;
  sender: string;
  evidence: string;
}

export const useDisputeKitEvidenceQuery = () => {
  const disputeKit = useConnectedContract(
    "DisputeKitClassic",
    ArbitrumRinkeby.chainId
  );
  const filter = disputeKit?.filters.Evidence();
  const { isLoading, data } = useQuery(["DisputeKitEvidence"], async () => {
    const evidences: IDisputeKitEvidence[] = [];
    if (disputeKit && filter) {
      await disputeKit.queryFilter(filter).then(async (response: Result) => {
        for (const evidenceEvent of response) {
          const evidence = evidenceEvent.args;
          evidences.push({
            core: evidence[0],
            evidenceGroupID: evidence[1],
            sender: evidence[2],
            evidence: evidence[3],
          });
        }
      });
    }
    return evidences.reverse();
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (disputeKit && filter) {
      disputeKit.on(filter, async (...evidence: Result) => {
        queryClient.setQueryData(
          "DisputeKitEvidence",
          (oldData: IDisputeKitEvidence[]): IDisputeKitEvidence[] => {
            return [
              {
                core: evidence[0],
                evidenceGroupID: evidence[1],
                sender: evidence[2],
                evidence: evidence[3],
              },
              ...oldData,
            ];
          }
        );
      });
      return () => {
        disputeKit.removeAllListeners();
      };
    }
    return;
  }, [disputeKit, filter, queryClient]);

  return { isLoading, data, disputeKit };
};
