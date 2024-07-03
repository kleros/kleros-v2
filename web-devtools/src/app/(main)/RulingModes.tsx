import React, { useState } from "react";
import styled from "styled-components";

import { Checkbox, Field } from "@kleros/ui-components-library";

import LightButton from "components/LightButton";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
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

const RulingModes: React.FC = (arbitrable) => {
  const [checked, setChecked] = useState(false);

  return (
    <div>
      <h3>Ruling Mode</h3>
      <Container>
        <RulingSettings>
          <LightButton text={"Rule Now Manually"} />
          <FieldContainer>
            ruling <Field placeholder={"1"}></Field>
          </FieldContainer>
        </RulingSettings>

        <RulingSettings>
          <LightButton text={"Run Automatically with a Preset"} />
          <FieldContainer>
            ruling <Field placeholder={"1"}></Field>
          </FieldContainer>
          <FieldContainer>
            <Checkbox label="" small checked={checked} onChange={() => setChecked((old) => !old)} />
            <Field placeholder={"0x00[dev address]"}></Field>
          </FieldContainer>
          <FieldContainer>
            <Checkbox label="" small checked={checked} onChange={() => setChecked((old) => !old)} />
            <Field placeholder={"0x00[dev address]"}></Field>
          </FieldContainer>
        </RulingSettings>

        <RulingSettings>
          <LightButton text={"Run Automatically Randomly"} />
        </RulingSettings>
      </Container>
    </div>
  );
};

export default RulingModes;
