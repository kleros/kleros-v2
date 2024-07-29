"use client";
import React from "react";
import styled from "styled-components";

import { DropdownCascader, Field } from "@kleros/ui-components-library";

import { SelectArbitrable } from "utils/dummyData";

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

const Ruler: React.FC = () => {
  return (
    <Container>
      <h1>Ruler</h1>

      <Arbitrables>
        <div>
          <label>Select Arbitrable</label>
          <DropdownCascader
            placeholder={"Select Arbitrable"}
            onSelect={() => {
              //todo;
            }}
            items={SelectArbitrable}
          />
        </div>
        <div>
          <label>Current Ruling Mode</label>
          <Field value={"auto mode"}></Field>
        </div>
      </Arbitrables>

      <SettingsPane>
        <RulingModes />
        <ChangeRuler />
      </SettingsPane>
    </Container>
  );
};
export default Ruler;
