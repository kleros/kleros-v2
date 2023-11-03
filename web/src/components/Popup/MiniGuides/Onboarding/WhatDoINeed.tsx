import React from "react";
import DarkModeWhatDoINeedImage from "tsx:assets/svgs/mini-guides/onboarding/what-do-i-need-dark-mode.svg";
import LightModeWhatDoINeedImage from "tsx:assets/svgs/mini-guides/onboarding/what-do-i-need-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const WhatDoINeed: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeWhatDoINeedImage} lightModeImage={LightModeWhatDoINeedImage} />
);

export default WhatDoINeed;
