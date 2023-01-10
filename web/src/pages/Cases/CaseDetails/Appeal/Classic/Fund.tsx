import React from "react";
import styled from "styled-components";
import { Field, Button } from "@kleros/ui-components-library";

const Fund: React.FC = () => {
  return (
    <div>
      <label>How much ETH do you want to contribute?</label>
      <div>
        <StyledField type="number" />
        <StyledButton disabled text="Fund" />
      </div>
    </div>
  );
};

const StyledField = styled(Field)`
  width: 100%;
  & > input {
    text-align: center;
  }
  &:before {
    position: absolute;
    content: "ETH";
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.primaryText};
  }
`;

const StyledButton = styled(Button)`
  margin: auto;
  margin-top: 12px;
`;

export default Fund;
