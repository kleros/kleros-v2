import React from "react";
import styled from "styled-components";
import { utils } from "ethers";
import { Tooltip } from "@kleros/ui-components-library";
import Table from "components/table";
import { Skeleton } from "components/skeleton-provider";
import { IForeignGatewayDisputeData } from "queries/useForeignGatewayDisputeQuery";
import { shortenString } from "src/utils/shortenString";
import ActionButton from "./action-button";

const columnNames = [
  "Local Dispute ID",
  "Dispute Hash",
  "Choices",
  "extraData",
  "Arbitrable",
  "Arbitrable Cost",
  "Action",
];

const StyledTooltip = styled(Tooltip)`
  span {
    z-index: 10;
    small {
      word-break: break-all;
    }
  }
`;

const formatData = (
  dispute: IForeignGatewayDisputeData,
  relayedHashes?: string[]
): React.ReactNode[] => [
  dispute.localDisputeID.toString(),
  <StyledTooltip small place="right" text={dispute.disputeHash} key={1}>
    {shortenString(dispute.disputeHash)}
  </StyledTooltip>,
  dispute.choices.toString(),
  <StyledTooltip small place="right" text={dispute.extraData} key={3}>
    {shortenString(dispute.extraData)}
  </StyledTooltip>,
  <StyledTooltip small place="right" text={dispute.arbitrable} key={4}>
    {shortenString(dispute.arbitrable)}
  </StyledTooltip>,
  utils.formatEther(dispute.paid) + " ETH",
  <ActionButton key={6} {...{ dispute, relayedHashes }} />,
];

const DisputeCreationTable: React.FC<{
  data?: IForeignGatewayDisputeData[];
  relayedHashes?: string[];
}> = ({ data, relayedHashes, ...props }) => {
  const rows = data
    ? data.map((dispute: IForeignGatewayDisputeData) =>
        formatData(dispute, relayedHashes)
      )
    : [Array(columnNames.length).fill(<Skeleton />)];
  return (
    <Table
      {...{ rows, columnNames, ...props }}
      title="Outgoing Dispute Creations"
    />
  );
};

export default DisputeCreationTable;
