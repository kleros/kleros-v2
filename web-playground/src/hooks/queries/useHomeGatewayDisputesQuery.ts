import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { ArbitrumRinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { BigNumber } from "ethers";
import { useConnectedContract } from "hooks/useConnectedContract";

export interface IHomeGatewayDispute {
  arbitrator: string;
  disputeID: BigNumber;
  metaEvidenceID: BigNumber;
  evidenceGroupID: BigNumber;
}

export const useHomeGatewayDisputesQuery = () => {
  const connectedContract = useConnectedContract(
    "HomeGatewayToEthereum",
    ArbitrumRinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.Dispute();
  const { isError, isLoading, data } = useQuery(
    ["HomeGatewayDisputes"],
    async () => {
      const disputes: IHomeGatewayDispute[] = [];
      if (connectedContract && filter) {
        await connectedContract
          .queryFilter(filter)
          .then(async (response: Result) => {
            for (const event of response) {
              const dispute = event.args;
              disputes.push({
                arbitrator: dispute[0],
                disputeID: dispute[1],
                metaEvidenceID: dispute[2],
                evidenceGroupID: dispute[3],
              });
            }
          });
      }
      return disputes.reverse();
    }
  );
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...dispute: Result) => {
        queryClient.setQueryData(
          "HomeGatewayDisputes",
          (oldData: IHomeGatewayDispute[]) => {
            return [
              {
                arbitrator: dispute[0],
                disputeID: dispute[1],
                metaEvidenceID: dispute[2],
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

  return { data, isLoading, isError, connectedContract };
};

export interface IHomeGatewayRelayedDispute extends IHomeGatewayDispute {
  disputeHash: string;
  arbitrationCost: BigNumber;
  relayer: string;
}

export const useHomeGatewayDisputesRelayedQuery = () => {
  const { data: rawData, connectedContract } = useHomeGatewayDisputesQuery();
  const { isLoading, data } = useQuery(
    ["HomeGatewayDisputesRelayed"],
    async () => {
      const data: IHomeGatewayRelayedDispute[] = [];
      if (rawData && connectedContract)
        for (const dispute of rawData) {
          const disputeHash = await connectedContract.disputeIDtoHash(
            dispute.disputeID
          );
          const relayedData = await connectedContract.disputeHashtoRelayedData(
            disputeHash
          );
          data.push({
            disputeHash,
            ...dispute,
            ...relayedData,
          });
        }
      return data;
    },
    {
      enabled: Boolean(rawData),
    }
  );
  return { isLoading, data, rawData };
};
