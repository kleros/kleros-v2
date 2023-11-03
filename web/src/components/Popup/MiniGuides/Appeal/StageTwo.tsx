import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModeStageTwoImage from "tsx:assets/svgs/mini-guides/appeal/stage-two-dark-mode.svg";
import LightModeStageTwoImage from "tsx:assets/svgs/mini-guides/appeal/stage-two-light-mode.svg";

const StageTwo: React.FC = () => {
  const theme = useTheme();
  const StageTwoImage = theme.name === "dark" ? DarkModeStageTwoImage : LightModeStageTwoImage;

  return <StyledImage as={StageTwoImage} />;
};

export default StageTwo;
