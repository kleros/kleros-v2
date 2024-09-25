import React from "react";
import styled from "styled-components";

import { Field } from "@kleros/ui-components-library";

import { useRulerContext } from "context/RulerContext";

const Arbitrables = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 8px 16px;
  border-radius: 3px;
`;
const StyledLabel = styled.label``;

const SelectArbitrable: React.FC = () => {
  const { arbitrable, setArbitrable } = useRulerContext();
  return (
    <Arbitrables>
      <StyledLabel>Arbitrable:</StyledLabel>
      <Field
        value={arbitrable}
        placeholder="Enter Arbitrable"
        onChange={(e) => {
          setArbitrable(e.target.value);
        }}
      />
    </Arbitrables>
  );
};

export default SelectArbitrable;
