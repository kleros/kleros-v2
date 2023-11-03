import React from "react";
import styled, { useTheme, css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import DarkModeStageOneImage from "tsx:assets/svgs/mini-guides/appeal/stage-one-dark-mode.svg";
import LightModeStageOneImage from "tsx:assets/svgs/mini-guides/appeal/stage-one-light-mode.svg";

const StyledStageOneImage = styled.div`
  width: calc(260px + (340 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const StageOne: React.FC = () => {
  const theme = useTheme();
  const StageOneImage = theme.name === "dark" ? DarkModeStageOneImage : LightModeStageOneImage;

  return <StyledStageOneImage as={StageOneImage} />;
};

export default StageOne;
