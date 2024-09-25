"use client";
import React from "react";
import styled from "styled-components";

import RulerContextProvider from "context/RulerContext";

import { responsiveSize } from "styles/responsiveSize";

import ChangeDeveloper from "./ChangeDeveloper";
import ManualRuling from "./ManualRuling";
import RulingModes from "./RulingModes";
import SelectArbitrable from "./SelectArbitrable";

const Container = styled.div`
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin: 16px 32px;
  align-items: center;
  padding: ${responsiveSize(32, 72)} ${responsiveSize(16, 132)} ${responsiveSize(76, 96)};
`;

const Ruler: React.FC = () => {
  return (
    <RulerContextProvider>
      <Container>
        <h1>Ruler</h1>
        <SelectArbitrable />
        <RulingModes />
        <ManualRuling />
        <ChangeDeveloper />
      </Container>
    </RulerContextProvider>
  );
};
export default Ruler;
