import React from "react";
import { useTheme } from "styled-components";
import { StyledImage } from "../Template";
import DarkModeCrowdfundAppealImage from "tsx:assets/svgs/mini-guides/appeal/crowdfund-appeal-dark-mode.svg";
import LightModeCrowdfundAppealImage from "tsx:assets/svgs/mini-guides/appeal/crowdfund-appeal-light-mode.svg";

const CrowdfundAppeal: React.FC = () => {
  const theme = useTheme();
  const CrowdfundAppealImage = theme.name === "dark" ? DarkModeCrowdfundAppealImage : LightModeCrowdfundAppealImage;

  return <StyledImage as={CrowdfundAppealImage} />;
};

export default CrowdfundAppeal;
