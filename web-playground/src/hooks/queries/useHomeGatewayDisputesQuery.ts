import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { ArbitrumRinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { utils, Contract } from "ethers";
import { useConnectedContract } from "hooks/useConnectedContract";
import { shortenString } from "src/utils/shortenString";

export const useHomeGatewayDisputesQuery = () => {
  const connectedContract = useConnectedContract(
    "HomeGateway",
    ArbitrumRinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.Dispute();
  const { isError, isLoading, data } = useQuery(
    ["homeGatewayDisputes"],
    async () => {
      const disputes: string[][] = [];
      if (connectedContract && filter) {
        await connectedContract
          .queryFilter(filter)
          .then(async (response: Result) => {
            for (const event of response) {
              disputes.push(event.args);
            }
          });
      }
      return disputes.reverse();
    }
  );
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...event: Result) => {
        queryClient.setQueryData("outgoingMessages", (oldData: string[]) => {
          return [event, ...oldData];
        });
      });
      return () => {
        connectedContract.removeAllListeners();
      };
    }
    return;
  }, [connectedContract, filter, queryClient]);

  return { data, isLoading, isError, connectedContract };
};

const disputeToRow = async (dispute: Result, connectedContract: Contract) => {
  const disputeHash = await connectedContract.disputeIDtoHash(
    dispute[1].toString()
  );
  const relayedData = await connectedContract.disputeHashtoRelayedData(
    disputeHash
  );
  const row = [
    dispute[1].toString(),
    shortenString(disputeHash.toString()),
    shortenString(relayedData.relayer.toString()),
    utils.formatEther(relayedData.arbitrationCost.toString()) + " ETH",
  ];
  return row;
};

export const useFormatedHomeGatewayDisputesQuery = () => {
  const { data: rawData, connectedContract } = useHomeGatewayDisputesQuery();
  const { isLoading, data } = useQuery(
    ["formatedHomeGatewayDisputes"],
    async () => {
      const rows = [];
      if (rawData && connectedContract)
        for (const disputeEvent of rawData) {
          const row = await disputeToRow(disputeEvent, connectedContract);
          rows.push(row);
        }
      return rows;
    },
    {
      enabled: Boolean(rawData),
    }
  );
  return { isLoading, data, rawData };
};
