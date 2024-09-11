"use client";
import React from "react";
import styled from "styled-components";

import { DropdownCascader } from "@kleros/ui-components-library";

import { SelectArbitrable } from "utils/dummyData";

import { responsiveSize } from "styles/responsiveSize";

import ChangeRuler from "./ChangeRuler";
import ManualRuling from "./ManualRuling";
import RulingModes from "./RulingModes";

const Container = styled.div`
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin: 16px 32px;
  align-items: center;
  padding: ${responsiveSize(32, 72)} ${responsiveSize(16, 132)} ${responsiveSize(76, 96)};
`;

const Arbitrables = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.klerosUIComponentsWhiteBackground};
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 8px 16px;
  border-radius: 3px;
`;

const Ruler: React.FC = () => {
  return (
    <Container>
      <h1>Ruler</h1>

      <Arbitrables>
        <label>Arbitrable:</label>
        <DropdownCascader
          placeholder={"Select Arbitrable"}
          onSelect={() => {
            //todo;
          }}
          items={SelectArbitrable}
        />
      </Arbitrables>

      <RulingModes />
      <ManualRuling />
      <ChangeRuler />
    </Container>
  );
};
export default Ruler;
