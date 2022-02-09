import React from "react";
import styled from "styled-components";
import Table from "../../table";
import CurrentPhase from "./current-phase";
import DisputeID from "./dispute-id";

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

const table1ColumnsNames = [
  "Local Dispute ID",
  "Dispute Hash",
  "Choices",
  "extraData",
  "Submission Price",
  "Ticket ID",
  "Status",
];

const table1Rows = [
  ["3", "789...890", "3", "0x00...000", "0.01 ETH", "42", "SENT"],
];

const table2ColumnsNames = [
  "Local Dispute ID",
  "Dispute Hash",
  "Ruling",
  "Status",
];

const table2Rows = [["3", "789...890", "1", "RELAYED"]];

const KlerosCore: React.FC = () => {
  return (
    <Wrapper>
      <CurrentPhase />
      <DisputeID />
      <StyledTable
        rows={table1Rows}
        columnNames={table1ColumnsNames}
        title="Outgoing Dispute Creations"
      />
      <StyledTable
        rows={table2Rows}
        columnNames={table2ColumnsNames}
        title="Incoming Ruling"
      />
    </Wrapper>
  );
};

export default KlerosCore;
