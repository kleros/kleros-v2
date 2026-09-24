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
  > span {
    margin-top: 16px;
  }
`;

const StyledLabel = styled.label`
  width: 100%;
  margin-bottom: 12px;
`;

type ILabeledInput = React.ComponentProps<typeof TextField>;

const LabeledInput: React.FC<ILabeledInput> = ({ label, inputProps, ...props }) => {
  const inputId = React.useId();
  const labelId = React.useId();
  return (
    <Container>
      {!isUndefined(label) ? (
        <StyledLabel id={labelId} htmlFor={inputId}>
          {label}
        </StyledLabel>
      ) : null}
      <StyledField
        {...props}
        // react-aria only recognises the label through aria-labelledby, not htmlFor.
        aria-labelledby={isUndefined(label) ? undefined : labelId}
        inputProps={{ dir: "auto", ...inputProps, id: inputId }}
      />
    </Container>
  );
};

export default LabeledInput;
