import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: none;
  width: 100%;
  background-color: ${({ theme }) => theme.lightBlue};
  border: 1px solid ${({ theme }) => theme.stroke};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  padding: 16px 20px;
  margin-top: ${responsiveSize(12, 16)};
  gap: 12px;

  ${landscapeStyle(
    () => css`
      display: flex;
    `
  )}
`;

const StyledLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
`;

const JurorLabel = styled(StyledLabel)`
  flex: 1;
  min-width: 150px;
  text-align: left;
`;

const StakeLabel = styled(StyledLabel)`
  width: 90px;
  text-align: right;
  flex-shrink: 0;
`;

const CourtLabelContainer = styled.div`
  width: 110px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const CourtLabel = styled(StyledLabel)`
  text-align: right;
`;

const DateLabel = styled(StyledLabel)`
  width: 120px;
  text-align: right;
  flex-shrink: 0;
`;

const courtTooltipMsg =
  "When you are staked in a subcourt you are staked in its parent courts too. eg. Staking in the Non Technical court automatically stake in its parents: Blockchain, and General Court.";

export const DesktopHeader: React.FC = () => {
  return (
    <Container>
      <JurorLabel>Juror</JurorLabel>
      <StakeLabel>PNK Staked</StakeLabel>
      <CourtLabelContainer>
        <WithHelpTooltip place="top" tooltipMsg={courtTooltipMsg}>
          <CourtLabel>Court</CourtLabel>
        </WithHelpTooltip>
      </CourtLabelContainer>
      <DateLabel>Date</DateLabel>
    </Container>
  );
};
