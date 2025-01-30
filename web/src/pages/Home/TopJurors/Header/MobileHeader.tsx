import React from "react";
import styled, { css } from "styled-components";

import { useToggle } from "react-use";
import { useParams } from "react-router-dom";

import { landscapeStyle } from "styles/landscapeStyle";

import { decodeURIFilter } from "utils/uri";

import HowItWorks from "components/HowItWorks";
import JurorLevels from "components/Popup/MiniGuides/JurorLevels";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  border-bottom: none;
  flex-wrap: wrap;

  ${landscapeStyle(
    () => css`
      display: none;
      padding: 16px 24px;
    `
  )}
`;

const StyledLabel = styled.label`
  font-size: 16px;
`;

export const MobileHeader: React.FC = () => {
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  const { filter } = useParams();
  const { id: searchValue } = decodeURIFilter(filter ?? "all");

  return (
    <Container>
      <StyledLabel>{!searchValue ? "Ranking" : "Jurors"}</StyledLabel>
      <HowItWorks
        isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
        toggleMiniGuide={toggleJurorLevelsMiniGuide}
        MiniGuideComponent={JurorLevels}
      />
    </Container>
  );
};
