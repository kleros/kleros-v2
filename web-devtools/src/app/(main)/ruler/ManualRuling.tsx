import React, { useState } from "react";
import styled from "styled-components";

import { Button } from "@kleros/ui-components-library";

import LabeledInput from "components/LabeledInput";

import Header from "./Header";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SelectContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const ManualRuling: React.FC = () => {
  const [tie, setTie] = useState<boolean>(false);
  const [overriden, setOverriden] = useState<boolean>(false);
  const [disputeId, setDisputeId] = useState<number>();
  const [ruling, setRuling] = useState<number>();

  return (
    <Container>
      <Header text="Manual Ruling" />
      <SelectContainer>
        <LabeledInput
          label="Dispute ID"
          type="number"
          value={disputeId}
          onChange={(e) => setDisputeId(Number(e.target.value))}
        />

        <LabeledInput label="Ruling" type="number" value={ruling} onChange={(e) => setRuling(Number(e.target.value))} />
        <LabeledInput label="Tie" inputType="checkbox" checked={tie} onChange={() => setTie((prev) => !prev)} />
        <LabeledInput
          label="Overidden"
          inputType="checkbox"
          checked={overriden}
          onChange={() => setOverriden((prev) => !prev)}
        />
      </SelectContainer>

      <Button text="Rule" />
    </Container>
  );
};

export default ManualRuling;
