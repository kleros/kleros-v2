import React from "react";
import DarkModePayoffSimulatorImage from "tsx:assets/svgs/mini-guides/appeal/payoff-simulator-dark-mode.svg";
import LightModePayoffSimulatorImage from "tsx:assets/svgs/mini-guides/appeal/payoff-simulator-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const PayoffSimulator: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModePayoffSimulatorImage} lightModeImage={LightModePayoffSimulatorImage} />
);

export default PayoffSimulator;
