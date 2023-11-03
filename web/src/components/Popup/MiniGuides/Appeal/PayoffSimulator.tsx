import React from "react";
import styled, { useTheme, css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import DarkModePayoffSimulatorImage from "tsx:assets/svgs/mini-guides/appeal/payoff-simulator-dark-mode.svg";
import LightModePayoffSimulatorImage from "tsx:assets/svgs/mini-guides/appeal/payoff-simulator-light-mode.svg";

const StyledPayoffSimulatorImage = styled.div`
  width: calc(260px + (340 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const PayoffSimulator: React.FC = () => {
  const theme = useTheme();
  const PayoffSimulatorImage = theme.name === "dark" ? DarkModePayoffSimulatorImage : LightModePayoffSimulatorImage;

  return <StyledPayoffSimulatorImage as={PayoffSimulatorImage} />;
};

export default PayoffSimulator;
