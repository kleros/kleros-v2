"use client";
import React, { useState } from "react";
import styled from "styled-components";

import { DropdownCascader, Field } from "@kleros/ui-components-library";

import { SelectArbitrable } from "utils/dumyData";

import LightButton from "components/LightButton";

import ChangeRuler from "./ChangeRuler";
import RulingModes from "./RulingModes";

const Container = styled.div`
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  margin: 16px 32px;
  align-items: center;
`;
const Arbitrables = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
`;

const SettingsPane = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
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

export default function Home() {
  const [selectedArbitrable, setSelectedArbitrable] = useState<string | number>("");

  return (
    <Container>
      <h1>Ruler</h1>

      <Arbitrables>
        <div>
          <label>Select Arbitrable</label>
          <DropdownCascader
            placeholder={"Select Arbitrable"}
            onSelect={(value) => {
              setSelectedArbitrable(value);
            }}
            items={SelectArbitrable}
          />
        </div>
        <div>
          <label>Current Ruling Mode</label>
          <Field value={"auto random"}></Field>
        </div>
      </Arbitrables>

      <SettingsPane>
        <RulingModes />
        <ChangeRuler />
      </SettingsPane>
    </Container>
  );
}
