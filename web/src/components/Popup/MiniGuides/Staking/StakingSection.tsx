import React from "react";
import styled, { useTheme, css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import DarkModeStakingSectionImage from "tsx:assets/svgs/mini-guides/staking/staking-section-dark-mode.svg";
import LightModeStakingSectionImage from "tsx:assets/svgs/mini-guides/staking/staking-section-light-mode.svg";

const StyledStakingSectionImage = styled.div`
  width: calc(260px + (360 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const StakingSection: React.FC = () => {
  const theme = useTheme();
  const StakingSectionImage = theme.name === "dark" ? DarkModeStakingSectionImage : LightModeStakingSectionImage;

  return <StyledStakingSectionImage as={StakingSectionImage} />;
};

export default StakingSection;
