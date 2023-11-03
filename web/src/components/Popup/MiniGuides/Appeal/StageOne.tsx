import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModeStageOneImage from "tsx:assets/svgs/mini-guides/appeal/stage-one-dark-mode.svg";
import LightModeStageOneImage from "tsx:assets/svgs/mini-guides/appeal/stage-one-light-mode.svg";

const StageOne: React.FC = () => {
  const theme = useTheme();
  const StageOneImage = theme.name === "dark" ? DarkModeStageOneImage : LightModeStageOneImage;

  return <StyledImage as={StageOneImage} />;
};

export default StageOne;
