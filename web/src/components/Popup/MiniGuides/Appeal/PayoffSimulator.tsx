import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModePayoffSimulatorImage from "tsx:assets/svgs/mini-guides/appeal/payoff-simulator-dark-mode.svg";
import LightModePayoffSimulatorImage from "tsx:assets/svgs/mini-guides/appeal/payoff-simulator-light-mode.svg";

const PayoffSimulator: React.FC = () => {
  const theme = useTheme();
  const PayoffSimulatorImage = theme.name === "dark" ? DarkModePayoffSimulatorImage : LightModePayoffSimulatorImage;

  return <StyledImage as={PayoffSimulatorImage} />;
};

export default PayoffSimulator;
