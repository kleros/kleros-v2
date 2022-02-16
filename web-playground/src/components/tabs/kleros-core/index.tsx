import React from "react";
import styled from "styled-components";
import Table from "../../table";
import DisputesTable from "./disputes-table";
import DisputeID from "./dispute-id";
import { useKlerosCoreDisputesInfoQuery } from "queries/useKlerosCoreDisputesQuery";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
`;

const StyledTable = styled(Table)`
  height: 40%;
  width: 100%;
`;

const table2ColumnsNames = [
  "Address",
  "Staked PNK",
  "Locked PNK",
  "Last performance",
];

const table2Rows = [["3", "789...890", "1", "RELAYED"]];

const KlerosCore: React.FC = () => {
  const { data } = useKlerosCoreDisputesInfoQuery();
  return (
    <Wrapper>
      <DisputeID {...{ data }} />
      <DisputesTable {...{ data }} />
      <StyledTable
        rows={table2Rows}
        columnNames={table2ColumnsNames}
        title="Jurors"
      />
    </Wrapper>
  );
};

export default KlerosCore;
