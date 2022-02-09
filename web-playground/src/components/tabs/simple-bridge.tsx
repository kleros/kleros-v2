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
  height: 90%;
  width: 100%;
`;

const tableColumnsNames = [
  "Local Dispute ID",
  "Dispute Hash",
  "Choices",
  "extraData",
  "Arbitrable",
  "Arbitrable Cost",
  "Action",
];

const tableRows = [
  [
    "3",
    "789...890",
    "3",
    "0x00...000",
    "0xDead...BeeF",
    "0.01 ETH",
    <Button key={0} small text="Relay" />,
  ],
];

const SimpleBridge = () => {
  return (
    <Wrapper>
      <StyledTable
        rows={tableRows}
        columnNames={tableColumnsNames}
        title="Outgoing Dispute Creations"
      />
    </Wrapper>
  );
};

export default SimpleBridge;
