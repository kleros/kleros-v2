import React from "react";
import { useToggle } from "react-use";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import Rewards from "./Rewards";
import Coherency from "./Coherency";
import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";

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
    () =>
      css`
        display: grid;
        grid-template-columns:
          min-content repeat(2, calc(80px + (210 - 60) * (min(max(100vw, 375px), 1250px) - 375px) / 875))
          max-content auto;
        column-gap: calc(16px + (28 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
        align-items: center;
      `
  )}
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
      <StyledLabel>#</StyledLabel>
      <StyledLabel>Juror</StyledLabel>
      <Rewards />
      <Coherency />
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
