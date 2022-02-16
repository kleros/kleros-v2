import React from "react";
import styled from "styled-components";
import { Skeleton } from "components/skeleton-provider";
import Table from "../table";
import { useFormatedHomeGatewayDisputesQuery } from "queries/useHomeGatewayDisputesQuery";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-start;
`;

const StyledTable = styled(Table)`
  height: 90%;
  width: 100%;
`;

const table1ColumnsNames = [
  "Core Dispute ID",
  "Dispute Hash",
  "Relayer",
  "Arbitration Cost",
];

const L2Gateway = () => {
  const { data } = useFormatedHomeGatewayDisputesQuery();
  const rows = data?.map((event) => event.map((element) => element.toString()));
  return (
    <Wrapper>
      <StyledTable
        rows={
          rows
            ? rows
            : [Array(table1ColumnsNames.length).fill([<Skeleton key={0} />])]
        }
        columnNames={table1ColumnsNames}
        title="Outgoing Ruling"
      />
    </Wrapper>
  );
};

export default L2Gateway;
