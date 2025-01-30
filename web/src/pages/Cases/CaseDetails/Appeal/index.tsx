import React from "react";
import styled, { css } from "styled-components";

import { useToggle } from "react-use";

import { Periods } from "consts/periods";
import { ClassicAppealProvider } from "hooks/useClassicAppealContext";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import AppealHistory from "./AppealHistory";
import Classic from "./Classic";

const Container = styled.div`
  padding: 16px;

  ${landscapeStyle(
    () => css`
      padding: 32px;
    `
  )}
`;

export const AppealHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 12px;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )}
`;

export const StyledTitle = styled.h1`
  margin: 0;
  font-size: ${responsiveSize(18, 24)};
`;

const Appeal: React.FC<{ currentPeriodIndex: number }> = ({ currentPeriodIndex }) => {
  const [isAppealMiniGuideOpen, toggleAppealMiniGuide] = useToggle(false);

  return (
    <Container>
      {Periods.appeal === currentPeriodIndex ? (
        <Classic isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
      ) : (
        <AppealHistory isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
      )}
    </Container>
  );
};

export default Appeal;
