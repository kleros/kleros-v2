import React from "react";
import styled from "styled-components";

import { Checkbox, Field, type CheckboxProps, type FieldProps } from "@kleros/ui-components-library";

const Container = styled.div`
  display: flex;
  max-width: 300px;
  min-width: 250px;
  height: 50px;
`;

const LabelContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
  border-radius: 6px 0px 0px 6px;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

const InputContainer = styled(LabelContainer)`
  position: relative;
  border-radius: 0px 6px 6px 0px;
  border-left: none;
`;

const StyledField = styled(Field)`
  width: auto;
  > input {
    border: none;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  height: 24px;
  width: 24px;
  padding: 0;
`;

type BaseProps = {
  inputType?: "field" | "checkbox";
  label: string;
};

type CheckboxInputProps = CheckboxProps & { inputType: "checkbox" };
type DefaultInputProps = FieldProps & { inputType?: "field" };

type LabeledInputProps = BaseProps & (CheckboxInputProps | DefaultInputProps);

const LabeledInput: React.FC<LabeledInputProps> = ({ inputType = "field", label, ...props }) => {
  return (
    <Container>
      <LabelContainer>
        <Label>{label}</Label>
      </LabelContainer>
      <InputContainer>
        {inputType === "field" && <StyledField {...props} />}
        {inputType === "checkbox" && <StyledCheckbox label="&nbsp;" {...props} />}
      </InputContainer>
    </Container>
  );
};

export default LabeledInput;
