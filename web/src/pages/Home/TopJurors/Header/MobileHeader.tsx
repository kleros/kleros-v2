import React from "react";
import { useToggle } from "react-use";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  padding: 24px;
  border 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-bottom: none;
  flex-wrap: wrap;
  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}
`;

const StyledLabel = styled.label`
  font-size: 16px;
`;

export const MobileHeader: React.FC = () => {
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  return (
    <Container>
      <StyledLabel>Ranking</StyledLabel>
      <HowItWorks
        isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
        toggleMiniGuide={toggleJurorLevelsMiniGuide}
        MiniGuideComponent={JurorLevels}
      />
    </Container>
  );
};
