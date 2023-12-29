import { Field, FieldProps } from "@kleros/ui-components-library";
import React from "react";
import styled from "styled-components";
import { isUndefined } from "utils/index";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const StyledField = styled(Field)`
  width: 100%;
  > small {
    margin-top: 16px;
    margin-bottom: 16px;
  }
`;

const StyledLabel = styled.label`
  width: 100%;
  margin-bottom: 12px;
`;

interface ILabeledInput extends FieldProps {
  label?: string;
}
const LabeledInput: React.FC<ILabeledInput> = (props) => {
  return (
    <Container>
      {!isUndefined(props.label) ? <StyledLabel id={props.label}>{props.label}</StyledLabel> : null}
      <StyledField {...props} id={props?.label} />
    </Container>
  );
};

export default LabeledInput;
