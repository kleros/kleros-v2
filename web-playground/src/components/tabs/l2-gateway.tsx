import React from "react";
import styled from "styled-components";
import Table from "../table";

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
  height: 45%;
  width: 100%;
`;

const table1ColumnsNames = [
  "Core Dispute ID",
  "Local Dispute ID",
  "Dispute Hash",
  "Ruling",
  "Withdrawal ID",
  "Status",
];

const table1Rows = [["72", "3", "234...2345", "1", "79386", "CONFIRMED"]];

const table2ColumnsNames = [
  "Local Dispute ID",
  "Dispute Hash",
  "Choices",
  "extraData",
  "Ticket ID",
  "Status",
];

const table2Rows = [["3", "780c2...eb4f", "3", "0x00...00", "42", "RELAYED"]];

const L2Gateway = () => {
  return (
    <Wrapper>
      <StyledTable
        rows={table1Rows}
        columnNames={table1ColumnsNames}
        title="Outgoing Ruling"
      />
      <StyledTable
        rows={table2Rows}
        columnNames={table2ColumnsNames}
        title="Incoming Dispute Creations"
      />
    </Wrapper>
  );
};

export default L2Gateway;
