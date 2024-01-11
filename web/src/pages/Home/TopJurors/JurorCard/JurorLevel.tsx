import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import PixelArt from "pages/Dashboard/JurorInfo/PixelArt";
import { getUserLevelData } from "utils/userLevelCalculation";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${landscapeStyle(
    () => css`
      gap: 16px;
      justify-content: end;
    `
  )}
`;

const StyledLabel = styled.label`
  font-size: 12px !important;

  &::before {
    content: "Lv. ";
  }

  ${landscapeStyle(
    () => css`
      font-size: 16px !important;

      &::before {
        content: "Level ";
      }
    `
  )}
`;

interface IJurorLevel {
  coherenceScore: number;
}

const JurorLevel: React.FC<IJurorLevel> = ({ coherenceScore }) => {
  const userLevelData = getUserLevelData(coherenceScore);
  const level = userLevelData.level;

  return (
    <Container>
      <StyledLabel>{level}</StyledLabel>
      <PixelArt width="32px" height="32px" level={level} />
    </Container>
  );
};
export default JurorLevel;
