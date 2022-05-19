import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { Bytes, BigNumber } from "ethers";
import { ArbitrumRinkeby, Rinkeby } from "@usedapp/core";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export interface IFastBridgeOutgoingMessage {
  target: string;
  messageHash: BigNumber;
  message: Bytes;
}

export const useFastBridgeOutgoingMessagesQuery = () => {
  const connectedContract = useConnectedContract(
    "FastBridgeSenderToEthereum",
    ArbitrumRinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.OutgoingMessage();
  const { isError, isLoading, data, refetch } = useQuery(
    ["FastBridgeOutgoingMessages"],
    async () => {
      const outgoingMessages: IFastBridgeOutgoingMessage[] = [];
      if (connectedContract && filter) {
        await connectedContract
          .queryFilter(filter)
          .then(async (response: Result) => {
            for (const messageEvent of response) {
              const message = messageEvent.args;
              outgoingMessages.push({
                target: message[0],
                messageHash: message[1],
                message: message[2],
              });
            }
          });
      }
      return outgoingMessages.reverse();
    }
  );
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...message: Result) => {
        queryClient.setQueryData(
          "FastBridgeOutgoingMessages",
          (oldData: string[]) => {
            return [
              {
                target: message[0],
                messageHash: message[1],
                message: message[2],
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

  return { isError, isLoading, data, connectedContract, refetch };
};

export interface IFastBridgeClaim extends IFastBridgeOutgoingMessage {
  bridger: string;
  claimedAt: BigNumber;
  claimDeposit: BigNumber;
  relayed: boolean;
}

export const useFastBridgeClaimsQuery = () => {
  const fastBridgeReceiver = useConnectedContract(
    "FastBridgeReceiverOnEthereum",
    Rinkeby.chainId
  );
  const { data: messages, refetch: refetchMessages } =
    useFastBridgeOutgoingMessagesQuery();
  const { isLoading, data, refetch } = useQuery(
    ["FastBridgeClaims"],
    async () => {
      await refetchMessages();
      const claims: IFastBridgeClaim[] = [];
      if (messages && fastBridgeReceiver) {
        for (const message of messages) {
          const rawClaim = await fastBridgeReceiver.claims(message.messageHash);
          const claim = {
            ...rawClaim,
            ...message,
          };
          claims.push(claim);
        }
      }
      return claims;
    },
    {
      enabled: Boolean(messages),
    }
  );
  useEffect(() => {
    if (fastBridgeReceiver) {
      const filter = fastBridgeReceiver.filters.ClaimReceived();
      fastBridgeReceiver.on(filter, () => {
        refetch();
      });
      return () => {
        fastBridgeReceiver.removeAllListeners();
      };
    }
    return;
  }, [fastBridgeReceiver, refetch]);
  return { isLoading, data };
};

export const useFastBridgeChallengeDurationQuery = () => {
  const fastBridgeReceiver = useConnectedContract(
    "FastBridgeReceiverOnEthereum",
    Rinkeby.chainId
  );
  const { isLoading, data } = useQuery(
    ["FastBridgeChallengeDuration"],
    async () => {
      if (fastBridgeReceiver)
        return await fastBridgeReceiver.challengeDuration();
    }
  );
  return { isLoading, data };
};
