import React from "react";
import styled from "styled-components";
import { utils } from "ethers";
import Table from "../../table";
import { Skeleton } from "components/skeleton-provider";
import { IHomeGatewayRelayedDispute } from "queries/useHomeGatewayDisputesQuery";
import { Tooltip } from "@kleros/ui-components-library";
import { shortenString } from "src/utils/shortenString";

const columnNames = [
  "Core Dispute ID",
  "Dispute Hash",
  "Relayer",
  "Arbitration Cost",
];

const StyledTooltip = styled(Tooltip)`
  span {
    z-index: 10;
    small {
      word-break: break-all;
    }
  }
`;

const formatData = (dispute: IHomeGatewayRelayedDispute): React.ReactNode[] => [
  dispute.disputeID.toString(),
  <StyledTooltip small place="right" text={dispute.disputeHash} key={1}>
    {shortenString(dispute.disputeHash)}
  </StyledTooltip>,
  <StyledTooltip small place="right" text={dispute.relayer} key={2}>
    {shortenString(dispute.relayer)}
  </StyledTooltip>,
  utils.formatEther(dispute.arbitrationCost) + " ETH",
];

const OutgoingDisputeCreationsTable: React.FC<{
  data?: IHomeGatewayRelayedDispute[];
}> = ({ data, ...props }) => {
  const rows = data
    ? data.map((dispute: IHomeGatewayRelayedDispute) => formatData(dispute))
    : [Array(columnNames.length).fill(<Skeleton />)];
  return (
    <Table
      {...{ rows, columnNames, ...props }}
      title="Outgoing Dispute Creations"
    />
  );
};

export default OutgoingDisputeCreationsTable;
