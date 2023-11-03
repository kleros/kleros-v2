import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModeHowItWorksImage from "tsx:assets/svgs/mini-guides/onboarding/how-it-works-dark-mode.svg";
import LightModeHowItWorksImage from "tsx:assets/svgs/mini-guides/onboarding/how-it-works-light-mode.svg";

const HowItWorks: React.FC = () => {
  const theme = useTheme();
  const HowItWorksImage = theme.name === "dark" ? DarkModeHowItWorksImage : LightModeHowItWorksImage;

  return <StyledImage as={HowItWorksImage} />;
};

export default HowItWorks;
