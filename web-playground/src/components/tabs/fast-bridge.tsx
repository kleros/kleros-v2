import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import Table from "../table";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

const StyledTable = styled(Table)`
  height: 45%;
  width: 100%;
`;

const table1ColumnsNames = ["Message Hash", "Action"];

const table1Rows = [["2501c4...ac5", <Button key={0} small text="Claim" />]];

const table2ColumnsNames = [
  "Message Hash",
  "Claim Block Time",
  "Remaining Challenge Time",
  "Action",
];

const table2Rows = [
  ["2501c4...ac5", "# 285", "5 blocks", <Button key={0} small text="Relay" />],
];

const FastBridge = () => {
  return (
    <Wrapper>
      <StyledTable
        rows={table1Rows}
        columnNames={table1ColumnsNames}
        title="Ruling: OutgoingMessage event"
      />
      <StyledTable
        rows={table2Rows}
        columnNames={table2ColumnsNames}
        title="Ruling: Claim event"
      />
    </Wrapper>
  );
};

export default FastBridge;
