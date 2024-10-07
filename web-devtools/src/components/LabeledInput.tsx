import React, { useRef } from "react";
import styled, { css } from "styled-components";

import { Checkbox, Field, type CheckboxProps, type FieldProps } from "@kleros/ui-components-library";

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 280px;
  max-width: 280px;
  height: 46px;
  position: relative;
  box-sizing: border-box;
`;

const ContainerCss = css`
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.klerosUIComponentsStroke};
`;

const LabelContainer = styled.div<{ isField?: boolean }>`
  ${ContainerCss}
  border-radius: 3px 0px 0px 3px;
  background-color: ${({ theme }) => theme.klerosUIComponentsLightBackground};
  ${({ isField }) =>
    isField &&
    css`
      width: 50%;
      height: 45px;
      position: absolute;
      top: 0.5px;
      left: 0.5px;
      z-index: 1;
    `}
`;

const Label = styled.label`
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

const InputContainer = styled.div<{ isField?: boolean }>`
  ${ContainerCss}
  position: relative;
  border-radius: 0px 3px 3px 0px;
  border-left: none;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  ${({ isField }) =>
    isField &&
    css`
      width: 100%;
      z-index: 0;
      border-radius: 3px;
    `}
`;

const StyledField = styled(Field)<{ paddingLeft?: number }>`
  width: 100%;
  > input {
    border: none;
    box-sizing: border-box;
    ${({ paddingLeft = 0 }) =>
      paddingLeft &&
      css`
        padding-left: ${paddingLeft + 8}px;
      `}
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
  const labelRef = useRef<HTMLDivElement>(null);
  return (
    <Container>
      <LabelContainer ref={labelRef} isField={inputType === "field"}>
        <Label>{label}</Label>
      </LabelContainer>
      <InputContainer isField={inputType === "field"}>
        {inputType === "field" && <StyledField {...props} paddingLeft={labelRef.current?.offsetWidth} />}
        {inputType === "checkbox" && <StyledCheckbox label="&nbsp;" {...props} />}
      </InputContainer>
    </Container>
  );
};

export default LabeledInput;
