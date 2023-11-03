import React from "react";
import styled, { useTheme, css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import DarkModeStageTwoImage from "tsx:assets/svgs/mini-guides/appeal/stage-two-dark-mode.svg";
import LightModeStageTwoImage from "tsx:assets/svgs/mini-guides/appeal/stage-two-light-mode.svg";

const StyledStageTwoImage = styled.div`
  width: calc(260px + (340 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const StageTwo: React.FC = () => {
  const theme = useTheme();
  const StageTwoImage = theme.name === "dark" ? DarkModeStageTwoImage : LightModeStageTwoImage;

  return <StyledStageTwoImage as={StageTwoImage} />;
};

export default StageTwo;
