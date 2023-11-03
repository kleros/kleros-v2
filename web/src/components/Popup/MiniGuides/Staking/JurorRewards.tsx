import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModeJurorRewardsImage from "tsx:assets/svgs/mini-guides/staking/juror-rewards-dark-mode.svg";
import LightModeJurorRewardsImage from "tsx:assets/svgs/mini-guides/staking/juror-rewards-light-mode.svg";

const JurorRewards: React.FC = () => {
  const theme = useTheme();
  const JurorRewardsImage = theme.name === "dark" ? DarkModeJurorRewardsImage : LightModeJurorRewardsImage;

  return <StyledImage as={JurorRewardsImage} />;
};

export default JurorRewards;
