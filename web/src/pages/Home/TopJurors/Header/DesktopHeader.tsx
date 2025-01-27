import React from "react";
import styled, { css } from "styled-components";

import { useToggle } from "react-use";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import RankingIcon from "svgs/icons/ranking.svg";

import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";

import Coherence from "./Coherence";
import Rewards from "./Rewards";

const Container = styled.div`
  display: none;
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  border 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-bottom: 1px solid ${({ theme }) => theme.stroke};
  padding: 18.6px 32px;

  ${landscapeStyle(
    () => css`
      display: grid;
      grid-template-columns:
        min-content repeat(3, ${responsiveSize(160, 180, 900)})
        auto;
      column-gap: ${responsiveSize(12, 28, 900)};
      align-items: center;
    `
  )}
`;

const StyledRankingIcon = styled(RankingIcon)`
  path {
    fill: ${({ theme }) => theme.primaryText};
  }
`;

const StyledLabel = styled.label`
  font-size: 16px;
`;

const HowItWorksContainer = styled.div`
  display: flex;
  justify-content: end;
`;

export const DesktopHeader: React.FC = () => {
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);

  return (
    <Container>
      <StyledRankingIcon />
      <StyledLabel>Juror</StyledLabel>
      <Rewards />
      <Coherence />
      <HowItWorksContainer>
        <HowItWorks
          isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
          toggleMiniGuide={toggleJurorLevelsMiniGuide}
          MiniGuideComponent={JurorLevels}
        />
      </HowItWorksContainer>
    </Container>
  );
};
