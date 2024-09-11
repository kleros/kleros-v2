import React from "react";
import styled from "styled-components";

import { Button } from "@kleros/ui-components-library";

import LabeledInput from "components/LabeledInput";

import Header from "./Header";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledLabel = styled.label`
  word-wrap: break-word;
`;

const ChangeDeveloper: React.FC = () => {
  return (
    <Container>
      <Header text="Developer" />
      <InputContainer>
        <StyledLabel>Current Developer : 0xbe8d95497E53aB41d5A45CC8def90d0e59b49f99</StyledLabel>
        <LabeledInput label="New Developer" />
      </InputContainer>
      <Button text="Update" />
    </Container>
  );
};

export default ChangeDeveloper;
