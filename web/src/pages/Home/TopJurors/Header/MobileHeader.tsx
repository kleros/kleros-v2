import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { decodeURIFilter } from "utils/uri";

import { landscapeStyle } from "styles/landscapeStyle";

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
  const { t } = useTranslation();
  const [isJurorLevelsMiniGuideOpen, toggleJurorLevelsMiniGuide] = useToggle(false);
  const { filter } = useParams();
  const { id: searchValue } = decodeURIFilter(filter ?? "all");

  return (
    <Container>
      <StyledLabel>{!searchValue ? t("juror_levels.ranking") : t("juror_levels.jurors")}</StyledLabel>
      <HowItWorks
        isMiniGuideOpen={isJurorLevelsMiniGuideOpen}
        toggleMiniGuide={toggleJurorLevelsMiniGuide}
        MiniGuideComponent={JurorLevels}
      />
    </Container>
  );
};
