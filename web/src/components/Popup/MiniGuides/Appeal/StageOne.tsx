import React from "react";
import DarkModeStageOneImage from "tsx:assets/svgs/mini-guides/appeal/stage-one-dark-mode.svg";
import LightModeStageOneImage from "tsx:assets/svgs/mini-guides/appeal/stage-one-light-mode.svg";
import ImageRenderer from "../ImageRenderer";

const StageOne: React.FC = () => (
  <ImageRenderer darkModeImage={DarkModeStageOneImage} lightModeImage={LightModeStageOneImage} />
);

export default StageOne;
