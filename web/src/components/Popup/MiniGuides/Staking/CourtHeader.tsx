import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModeCourtHeaderImage from "tsx:assets/svgs/mini-guides/staking/court-header-dark-mode.svg";
import LightModeCourtHeaderImage from "tsx:assets/svgs/mini-guides/staking/court-header-light-mode.svg";

const CourtHeader: React.FC = () => {
  const theme = useTheme();
  const CourtHeaderImage = theme.name === "dark" ? DarkModeCourtHeaderImage : LightModeCourtHeaderImage;

  return <StyledImage as={CourtHeaderImage} />;
};

export default CourtHeader;
