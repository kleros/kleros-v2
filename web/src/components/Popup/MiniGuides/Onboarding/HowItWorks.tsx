import React from "react";
import styled, { useTheme } from "styled-components";
import DarkModeHowItWorksImage from "tsx:assets/svgs/mini-guides/onboarding/how-it-works-dark-mode.svg";
import LightModeHowItWorksImage from "tsx:assets/svgs/mini-guides/onboarding/how-it-works-light-mode.svg";

const StyledHowItWorksImage = styled.div`
  width: calc(260px + (379 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  height: calc(200px + (291 - 200) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const HowItWorks: React.FC = () => {
  const theme = useTheme();
  const HowItWorksImage = theme.name === "dark" ? DarkModeHowItWorksImage : LightModeHowItWorksImage;

  return <StyledHowItWorksImage as={HowItWorksImage} />;
};

export default HowItWorks;
