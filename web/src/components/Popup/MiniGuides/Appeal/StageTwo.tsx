import React from "react";
import DarkModeStageTwoImage from "tsx:assets/svgs/mini-guides/appeal/stage-two-dark-mode.svg";
import LightModeStageTwoImage from "tsx:assets/svgs/mini-guides/appeal/stage-two-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const StageTwo: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeStageTwoImage} lightModeImage={LightModeStageTwoImage} />
);

export default StageTwo;
