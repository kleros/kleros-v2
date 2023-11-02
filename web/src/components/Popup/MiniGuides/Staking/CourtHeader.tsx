import React from "react";
import styled, { useTheme, css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import DarkModeCourtHeaderImage from "tsx:assets/svgs/mini-guides/staking/court-header-dark-mode.svg";
import LightModeCourtHeaderImage from "tsx:assets/svgs/mini-guides/staking/court-header-light-mode.svg";

const StyledCourtHeaderImage = styled.div`
  width: calc(260px + (340 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const CourtHeader: React.FC = () => {
  const theme = useTheme();
  const CourtHeaderImage = theme.name === "dark" ? DarkModeCourtHeaderImage : LightModeCourtHeaderImage;

  return <StyledCourtHeaderImage as={CourtHeaderImage} />;
};

export default CourtHeader;
