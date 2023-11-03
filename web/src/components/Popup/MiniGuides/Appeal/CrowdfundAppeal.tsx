import React from "react";
import styled, { useTheme, css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import DarkModeCrowdfundAppealImage from "tsx:assets/svgs/mini-guides/appeal/crowdfund-appeal-dark-mode.svg";
import LightModeCrowdfundAppealImage from "tsx:assets/svgs/mini-guides/appeal/crowdfund-appeal-light-mode.svg";

const StyledCrowdfundAppealImage = styled.div`
  width: calc(260px + (340 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const CrowdfundAppeal: React.FC = () => {
  const theme = useTheme();
  const CrowdfundAppealImage = theme.name === "dark" ? DarkModeCrowdfundAppealImage : LightModeCrowdfundAppealImage;

  return <StyledCrowdfundAppealImage as={CrowdfundAppealImage} />;
};

export default CrowdfundAppeal;
