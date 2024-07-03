import React from "react";
import styled from "styled-components";

import { Field } from "@kleros/ui-components-library";

import LightButton from "components/LightButton";

const Container = styled.div`
  border: ${({ theme }) => theme.klerosUIComponentsPrimaryBlue} 1px solid;
  border-radius: 4px;
  padding: 16px;
`;

const RulingSettings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
`;
const FieldContainer = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  height: fit-content;
  padding-left: 8px;
  gap: 8px;
  font-size: 14px;
  border-radius: 4px;
  border: ${({ theme }) => theme.klerosUIComponentsStroke} 1px solid;
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
`;

const ChangeRuler = () => {
  return (
    <div>
      <h3>Change Ruler</h3>
      <Container>
        <label>Current Ruler</label>
        <Field value={"0xb78......09e441"}></Field>
        <RulingSettings>
          <LightButton text={"Change Ruler"} />
          <FieldContainer>
            address <Field placeholder={"0x00[dev address]"}></Field>
          </FieldContainer>
        </RulingSettings>
      </Container>
    </div>
  );
};

export default ChangeRuler;
