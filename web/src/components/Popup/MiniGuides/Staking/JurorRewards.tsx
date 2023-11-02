import React from "react";
import styled, { useTheme, css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import DarkModeJurorRewardsImage from "tsx:assets/svgs/mini-guides/staking/juror-rewards-dark-mode.svg";
import LightModeJurorRewardsImage from "tsx:assets/svgs/mini-guides/staking/juror-rewards-light-mode.svg";

const StyledJurorRewardsImage = styled.div`
  width: calc(260px + (340 - 260) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      width: 389px;
    `
  )}
`;

const JurorRewards: React.FC = () => {
  const theme = useTheme();
  const JurorRewardsImage = theme.name === "dark" ? DarkModeJurorRewardsImage : LightModeJurorRewardsImage;

  return <StyledJurorRewardsImage as={JurorRewardsImage} />;
};

export default JurorRewards;
