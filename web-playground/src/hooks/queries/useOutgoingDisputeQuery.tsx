import React, { useEffect } from "react";
import styled from "styled-components";
import { Rinkeby } from "@usedapp/core";
import { useQuery, useQueryClient } from "react-query";
import { utils } from "ethers";
import { Result } from "@ethersproject/abi";
import { Tooltip } from "@kleros/ui-components-library";
import { shortenString } from "src/utils/shortenString";
import { useConnectedContract } from "hooks/useConnectedContract";

export const useOutgoingDisputeQuery = () => {
  const connectedContract = useConnectedContract(
    "ForeignGateway",
    Rinkeby.chainId
  );
  const queryClient = useQueryClient();
  const filter = connectedContract?.filters.OutgoingDispute();
  const { isLoading, data } = useQuery(["outgoingDisputes"], async () => {
    const newOutgoingDisputes: any[] = [];
    if (connectedContract && filter) {
      await connectedContract
        .queryFilter(filter)
        .then(async (response: Result) => {
          for (const disputeEvent of response) {
            newOutgoingDisputes.push(disputeEvent.args);
          }
        });
    }
    return newOutgoingDisputes.reverse();
  });
  useEffect(() => {
    if (connectedContract && filter) {
      connectedContract.on(filter, async (...dispute: Result) => {
        queryClient.setQueryData("outgoingDisputes", (oldData: string[]) => {
          return [dispute, ...oldData];
        });
      });
      return () => {
        connectedContract.removeAllListeners();
      };
    }
    return;
  }, [connectedContract, filter, queryClient]);

  return { isLoading, data, connectedContract };
};

const StyledTooltip = styled(Tooltip)`
  span {
    z-index: 10;
    small {
      word-break: break-all;
    }
  }
`;

const disputeToRow = async (
  dispute: Result,
  disputeHashtoDisputeData: (disputeHash: string) => Promise<Result>
) => {
  const disputeData = await disputeHashtoDisputeData(dispute[0]);
  const row = [
    dispute[2].toString(),
    <StyledTooltip small place="right" text={dispute[0].toString()} key={0}>
      {shortenString(dispute[0].toString())}
    </StyledTooltip>,
    dispute[3].toString(),
    <StyledTooltip small place="right" text={dispute[4].toString()} key={1}>
      {shortenString(dispute[4].toString())}
    </StyledTooltip>,
    <StyledTooltip small place="right" text={dispute[5].toString()} key={2}>
      {shortenString(dispute[5].toString())}
    </StyledTooltip>,
    utils.formatEther(disputeData.paid) + " ETH",
    disputeData.ruled.toString(),
    <StyledTooltip small place="left" text={disputeData.relayer} key={3}>
      {shortenString(disputeData.relayer)}
    </StyledTooltip>,
  ];
  return row;
};

export const useFormatedOutgoingDisputeQuery = () => {
  const { data: rawData, connectedContract } = useOutgoingDisputeQuery();
  const { isLoading, data } = useQuery(
    ["formatedOutgoingDisputes"],
    async () => {
      const rows = [];
      if (rawData && connectedContract)
        for (const disputeEvent of rawData) {
          const row = await disputeToRow(
            disputeEvent,
            connectedContract.disputeHashtoDisputeData
          );
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
