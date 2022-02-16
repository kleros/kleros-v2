import React from "react";
import styled from "styled-components";
import Table from "../../table";
import { Skeleton } from "components/skeleton-provider";
import { useFormatedOutgoingDisputeQuery } from "queries/useOutgoingDisputeQuery";

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
  "Local Dispute ID",
  "Dispute Hash",
  "Choices",
  "extraData",
  "Arbitrable",
  "Fees Paid",
  "Ruled",
  "L2 Relayer",
];

const L1Gateway = () => {
  const { data } = useFormatedOutgoingDisputeQuery();
  return (
    <Wrapper>
      <StyledTable
        rows={
          data
            ? data
            : [Array(table1ColumnsNames.length).fill([<Skeleton key={0} />])]
        }
        columnNames={table1ColumnsNames}
        title="Outgoing Dispute Creations"
      />
    </Wrapper>
  );
};

export default L1Gateway;
