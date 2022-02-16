import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { ArbitrumRinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export const useOutgoingMessageQuery = () => {
  const connectedContract = useConnectedContract(
    "FastBridgeSender",
    ArbitrumRinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.OutgoingMessage();
  const { isError, isLoading, data } = useQuery(
    ["outgoingMessages"],
    async () => {
      const newOutgoingMessages: string[][] = [];
      if (connectedContract && filter) {
        await connectedContract
          .queryFilter(filter)
          .then(async (response: Result) => {
            for (const event of response) {
              newOutgoingMessages.push(event.args);
            }
          });
      }
      return newOutgoingMessages.reverse();
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

  return { isError, isLoading, data };
};
