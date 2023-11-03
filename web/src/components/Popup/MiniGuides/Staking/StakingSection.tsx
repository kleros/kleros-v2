import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModeStakingSectionImage from "tsx:assets/svgs/mini-guides/staking/staking-section-dark-mode.svg";
import LightModeStakingSectionImage from "tsx:assets/svgs/mini-guides/staking/staking-section-light-mode.svg";

const StakingSection: React.FC = () => {
  const theme = useTheme();
  const StakingSectionImage = theme.name === "dark" ? DarkModeStakingSectionImage : LightModeStakingSectionImage;

  return <StyledImage as={StakingSectionImage} />;
};

export default StakingSection;
