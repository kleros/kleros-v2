import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useToggle } from "react-use";
import Classic from "./Classic";
import { Periods } from "consts/periods";
import AppealHistory from "./AppealHistory";
import { ClassicAppealProvider } from "hooks/useClassicAppealContext";

const Container = styled.div`
  padding: calc(16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
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
`;

const Appeal: React.FC<{ currentPeriodIndex: number }> = ({ currentPeriodIndex }) => {
  const [isAppealMiniGuideOpen, toggleAppealMiniGuide] = useToggle(false);

  return (
    <ClassicAppealProvider>
      <Container>
        {Periods.appeal === currentPeriodIndex ? (
          <Classic isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
        ) : (
          <AppealHistory isAppealMiniGuideOpen={isAppealMiniGuideOpen} toggleAppealMiniGuide={toggleAppealMiniGuide} />
        )}
      </Container>
    </ClassicAppealProvider>
  );
};

export default Appeal;
