import React from "react";
import styled from "styled-components";
import { IArbitrableExampleRuledDispute } from "queries/useArbitrableExampleQuery";
import Table from "components/table";
import { Skeleton } from "components/skeleton-provider";

const columnNames = ["Local Dispute ID", "Ruling"];

const formatData = (
  dispute: IArbitrableExampleRuledDispute
): React.ReactNode[] => {
  return [
    dispute.localID.toString(),
    dispute.isRuled ? dispute.ruling?.toString() : "🤷",
  ];
};

const StyledTable = styled(Table)`
  height: 40%;
  width: 100%;
`;

const DisputesTable: React.FC<{
  data?: IArbitrableExampleRuledDispute[];
}> = ({ data }) => {
  const rows = data
    ? data.map((dispute: IArbitrableExampleRuledDispute) => formatData(dispute))
    : [Array(columnNames.length).fill(<Skeleton />)];
  return <StyledTable {...{ rows, columnNames }} title="Disputes" />;
};

export default DisputesTable;
