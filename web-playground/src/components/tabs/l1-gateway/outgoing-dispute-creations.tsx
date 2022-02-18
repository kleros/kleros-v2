import React from "react";
import styled from "styled-components";
import { utils } from "ethers";
import { Tooltip } from "@kleros/ui-components-library";
import Table from "components/table";
import { Skeleton } from "components/skeleton-provider";
import { IForeignGatewayDisputeData } from "queries/useForeignGatewayDisputeQuery";
import { shortenString } from "src/utils/shortenString";

const columnNames = [
  "Local Dispute ID",
  "Dispute Hash",
  "Choices",
  "extraData",
  "Arbitrable",
  "Fees Paid",
  "Ruled",
  "L2 Relayer",
];

const StyledTooltip = styled(Tooltip)`
  span {
    z-index: 10;
    small {
      word-break: break-all;
    }
  }
`;

const formatData = (dispute: IForeignGatewayDisputeData): React.ReactNode[] => [
  dispute.localDisputeID.toString(),
  <StyledTooltip small place="right" text={dispute.disputeHash} key={0}>
    {shortenString(dispute.disputeHash)}
  </StyledTooltip>,
  dispute.choices.toString(),
  <StyledTooltip small place="right" text={dispute.extraData} key={1}>
    {shortenString(dispute.extraData)}
  </StyledTooltip>,
  <StyledTooltip small place="right" text={dispute.arbitrable} key={2}>
    {shortenString(dispute.arbitrable)}
  </StyledTooltip>,
  utils.formatEther(dispute.paid) + " ETH",
  dispute.ruled.toString(),
  <StyledTooltip small place="left" text={dispute.relayer} key={3}>
    {shortenString(dispute.relayer)}
  </StyledTooltip>,
];

const OutgoingDisputeCreationsTable: React.FC<{
  data?: IForeignGatewayDisputeData[];
}> = ({ data, ...props }) => {
  const rows = data
    ? data.map((dispute: IForeignGatewayDisputeData) => formatData(dispute))
    : [Array(columnNames.length).fill(<Skeleton />)];
  return (
    <Table
      {...{ rows, columnNames, ...props }}
      title="Outgoing Dispute Creations"
    />
  );
};

export default OutgoingDisputeCreationsTable;
