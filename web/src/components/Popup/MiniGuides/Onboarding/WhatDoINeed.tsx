import React from "react";
import { useTheme } from "styled-components";
import DarkModeWhatDoINeedImage from "tsx:assets/svgs/mini-guides/onboarding/what-do-i-need-dark-mode.svg";
import LightModeWhatDoINeedImage from "tsx:assets/svgs/mini-guides/onboarding/what-do-i-need-light-mode.svg";

const WhatDoINeed: React.FC = () => {
  const theme = useTheme();
  const WhatDoINeedSVG = theme.name === "dark" ? DarkModeWhatDoINeedImage : LightModeWhatDoINeedImage;

  return <WhatDoINeedSVG />;
};

export default WhatDoINeed;
