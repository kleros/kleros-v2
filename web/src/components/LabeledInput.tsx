import React from "react";
import styled from "styled-components";

import { TextField } from "@kleros/ui-components-library";

import { isUndefined } from "utils/index";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const StyledField = styled(TextField)`
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

type ILabeledInput = React.ComponentProps<typeof TextField>;

const LabeledInput: React.FC<ILabeledInput> = ({ label, inputProps, ...props }) => {
  const inputId = React.useId();
  return (
    <Container>
      {!isUndefined(label) ? <StyledLabel htmlFor={inputId}>{label}</StyledLabel> : null}
      <StyledField {...props} inputProps={{ dir: "auto", ...inputProps, id: inputId }} />
    </Container>
  );
};

export default LabeledInput;
