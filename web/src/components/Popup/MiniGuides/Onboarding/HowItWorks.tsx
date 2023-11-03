import React from "react";
import DarkModeHowItWorksImage from "tsx:assets/svgs/mini-guides/onboarding/how-it-works-dark-mode.svg";
import LightModeHowItWorksImage from "tsx:assets/svgs/mini-guides/onboarding/how-it-works-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const HowItWorks: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeHowItWorksImage} lightModeImage={LightModeHowItWorksImage} />
);

export default HowItWorks;
