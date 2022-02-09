import React, { useState } from "react";
import styled from "styled-components";
import { Field, Button } from "@kleros/ui-components-library";
import Title from "../../title";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledTitle = styled(Title)`
  width: 200px;
`;

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledField = styled(Field)`
  width: 45px;
  input {
    padding: 0 16px;
  }
`;

interface ISubcourt {
  defaultValue: number;
  callback: (value: number) => void;
}

const Subcourt: React.FC<ISubcourt> = ({ defaultValue, callback }) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <Wrapper>
      <StyledTitle>Subcourt:</StyledTitle>
      <StyledContainer>
        <Button
          small
          text="-"
          onClick={() => {
            const newValue = value - 1;
            setValue(newValue);
            callback(newValue);
          }}
          disabled={value <= 0}
        />
        <StyledField {...{ value }} disabled />
        <Button
          small
          text="+"
          onClick={() => {
            const newValue = value + 1;
            setValue(newValue);
            callback(newValue);
          }}
          disabled={value >= 9}
        />
      </StyledContainer>
    </Wrapper>
  );
};

export default Subcourt;
