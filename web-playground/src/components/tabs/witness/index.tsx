import React from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import DisputeID from "../../dispute-id";
import Answers from "../../answers";
import Evidence from "./evidence";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 64px;
  display: flex;
  justify-content: center;
`;

const StyledContent = styled.div`
  width: 50%;
  height: 100%;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
`;

const StyledButton = styled(Button)`
  align-self: center;
`;

const options = [
  {
    label: "Alice",
    value: 0,
  },
  {
    label: "Bob",
    value: 1,
  },
  {
    label: "Charlie",
    value: 2,
  },
];

const Witness: React.FC = () => {
  return (
    <Wrapper>
      <StyledContent>
        <DisputeID items={[]} callback={() => {}} />
        <Evidence />
        <Answers title="Supporting:" callback={() => {}} {...{ options }} />
        <StyledButton text="Submit Evidence" />
      </StyledContent>
    </Wrapper>
  );
};

export default Witness;
