import { useEffect } from "react";
import { Rinkeby } from "@usedapp/core";
import { useQuery, useQueryClient } from "react-query";
import { BigNumber } from "ethers";
import { Result } from "@ethersproject/abi";
import { useConnectedContract } from "hooks/useConnectedContract";

export interface IForeignGatewayDispute {
  disputeHash: string;
  blockHash: string;
  localDisputeID: BigNumber;
  choices: BigNumber;
  extraData: string;
}

export const useForeignGatewayOutgoingDisputeQuery = () => {
  const connectedContract = useConnectedContract(
    "ForeignGatewayOnEthereum",
    Rinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.OutgoingDispute();
  const { isLoading, data } = useQuery(
    ["ForeignGatewayOutgoingDispute"],
    async () => {
      const newOutgoingDisputes: IForeignGatewayDispute[] = [];
      if (connectedContract && filter) {
        await connectedContract
          .queryFilter(filter)
          .then(async (response: Result) => {
            for (const disputeEvent of response) {
              const dispute = disputeEvent.args;
              newOutgoingDisputes.push({
                disputeHash: dispute[0],
                blockHash: dispute[1],
                localDisputeID: dispute[2],
                choices: dispute[3],
                extraData: dispute[4],
              });
            }
          });
      }
      return newOutgoingDisputes.reverse();
    }
  );
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...dispute: Result) => {
        queryClient.setQueryData(
          "ForeignGatewayOutgoingDispute",
          (oldData: IForeignGatewayDispute[]) => {
            return [
              {
                disputeHash: dispute[0],
                blockHash: dispute[1],
                localDisputeID: dispute[2],
                choices: dispute[3],
                extraData: dispute[4],
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

export interface IForeignGatewayDisputeData extends IForeignGatewayDispute {
  id: BigNumber;
  ruled: boolean;
  arbitrable: string;
  paid: BigNumber;
  relayer: string;
}

export const useForeignGatewayOutgoingDisputeDataQuery = () => {
  const { data: rawData, connectedContract } =
    useForeignGatewayOutgoingDisputeQuery();
  const { isLoading, data } = useQuery(
    ["ForeignGatewayOutgoingDisputeData"],
    async () => {
      const data: IForeignGatewayDisputeData[] = [];
      if (rawData && connectedContract) {
        const disputeHashtoDisputeData =
          connectedContract.disputeHashtoDisputeData;
        for (const rawDispute of rawData) {
          const disputeData = await disputeHashtoDisputeData(
            rawDispute.disputeHash
          );
          const dispute = {
            ...rawDispute,
            ...disputeData,
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
