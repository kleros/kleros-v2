import React from "react";
import styled from "styled-components";
import { Field } from "@kleros/ui-components-library";
import Title from "./title";

const Wrapper = styled.div`
  height: auto;
  width: auto;
  display: flex;
  align-items: center;
`;

const StyledField = styled(Field)`
  width: 105px;
  input {
    padding: 0 16px;
  }
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

interface IDisputeID {
  callback: (value: string) => void;
}

const DisputeID: React.FC<IDisputeID> = ({ callback }) => {
  return (
    <Wrapper>
      <StyledTitle>Dispute ID:</StyledTitle>
      <StyledField
        placeholder="DisputeID"
        onChange={(event) => {
          callback(event.target.value);
        }}
      />
    </Wrapper>
  );
};

export default DisputeID;
