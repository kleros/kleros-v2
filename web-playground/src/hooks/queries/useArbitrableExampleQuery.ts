import { useEffect } from "react";
import { Rinkeby } from "@usedapp/core";
import { useQuery, useQueryClient } from "react-query";
import { BigNumber } from "ethers";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export interface IArbitrableExampleDispute {
  arbitrator: string;
  disputeID: BigNumber;
  metaevidenceID: BigNumber;
  evidenceGroupID: BigNumber;
}

export const useArbitrableExampleDisputeQuery = () => {
  const connectedContract = useConnectedContract(
    "ArbitrableExample",
    Rinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.Dispute();
  const { isLoading, data } = useQuery(
    ["ArbitrableExampleDisputes"],
    async () => {
      const newDisputes: IArbitrableExampleDispute[] = [];
      if (connectedContract && filter) {
        await connectedContract
          .queryFilter(filter)
          .then(async (response: Result) => {
            for (const disputeEvent of response) {
              const dispute = disputeEvent.args;
              newDisputes.push({
                arbitrator: dispute[0],
                disputeID: dispute[1],
                metaevidenceID: dispute[2],
                evidenceGroupID: dispute[3],
              });
            }
          });
      }
      return newDisputes.reverse();
    }
  );
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...dispute: Result) => {
        queryClient.setQueryData(
          "ArbitrableExampleDisputes",
          (oldData: IArbitrableExampleDispute[]) => {
            return [
              {
                arbitrator: dispute[0],
                disputeID: dispute[1],
                metaevidenceID: dispute[2],
                evidenceGroupID: dispute[3],
              },
              ...oldData,
            ];
          }
        );
      });
      return () => {
        connectedContract.removeAllListeners();
      };
    }
    return;
  }, [connectedContract, filter, queryClient]);

  return { isLoading, data, connectedContract };
};

export interface IArbitrableExampleRuledDispute
  extends IArbitrableExampleDispute {
  localID: BigNumber;
  ruling: BigNumber;
  isRuled: boolean;
  numberOfRulingOptions: BigNumber;
}

export const useArbitrableExampleRuledDisputeQuery = () => {
  const { data: rawData, connectedContract } =
    useArbitrableExampleDisputeQuery();
  const { isLoading, data } = useQuery(
    ["ArbitrableExampleRuledDisputes"],
    async () => {
      const data: IArbitrableExampleRuledDispute[] = [];
      if (rawData && connectedContract) {
        const externalIDtoLocalID = connectedContract.externalIDtoLocalID;
        const disputes = connectedContract.disputes;
        for (const rawDispute of rawData) {
          const localID = await externalIDtoLocalID(rawDispute.disputeID);
          const disputeInfo = await disputes(localID);
          const dispute = {
            localID,
            ...rawDispute,
            ...disputeInfo,
          };
          data.push(dispute);
        }
      }
      return data;
    },
    {
      enabled: Boolean(rawData),
    }
  );
  return { isLoading, data };
};
