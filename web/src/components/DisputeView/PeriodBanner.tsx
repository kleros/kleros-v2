import React, { useMemo } from "react";
import styled, { Theme, css, useTheme } from "styled-components";

import { useTranslation } from "react-i18next";

import { Periods } from "consts/periods";

import { landscapeStyle } from "styles/landscapeStyle";

interface IContainer {
  frontColor: string;
  backgroundColor: string;
}

const Container = styled.div<IContainer>`
  height: 45px;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
  border-top: 5px solid ${({ frontColor }) => frontColor};
  background-color: ${({ backgroundColor }) => backgroundColor};

  ${landscapeStyle(
    () => css`
      padding: 0 24px;
    `
  )}
`;

const StyledLabel = styled.label<{ frontColor: string; withDot?: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ frontColor }) => frontColor};
  ${({ withDot, frontColor }) =>
    withDot
      ? css`
          ::before {
            content: "";
            display: inline-block;
            height: 8px;
            width: 8px;
            border-radius: 50%;
            margin-right: 8px;
            background-color: ${frontColor};
            flex-shrink: 0;
          }
        `
      : null}
`;

export interface IPeriodBanner {
  id: number;
  period: Periods;
}

export const getPeriodColors = (period: Periods, theme: Theme): [string, string] => {
  switch (period) {
    case Periods.appeal:
      return [theme.tint, theme.tintMedium];
    case Periods.execution:
      return [theme.secondaryPurple, theme.mediumPurple];
    default:
      return [theme.primaryBlue, theme.mediumBlue];
  }
};

export const getPeriodLabel = (period: Periods, verbose: boolean, t: (key: string) => string): string => {
  switch (period) {
    case Periods.evidence:
      return verbose ? t("case_status.in_progress_submitting_evidence") : t("case_status.submitting_evidence");
    case Periods.commit:
      return verbose ? t("case_status.in_progress_committing_vote") : t("case_status.committing_vote");
    case Periods.vote:
      return verbose ? t("case_status.in_progress_voting") : t("case_status.voting");
    case Periods.appeal:
      return t("case_status.crowdfunding_appeal");
    case Periods.execution:
      return t("case_status.closed");
    default:
      return t("case_status.in_progress");
  }
};

const PeriodBanner: React.FC<IPeriodBanner> = ({ id, period }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [frontColor, backgroundColor] = useMemo(() => getPeriodColors(period, theme), [theme, period]);
  return (
    <Container {...{ frontColor, backgroundColor }}>
      <StyledLabel frontColor={frontColor} withDot>
        {getPeriodLabel(period, true, t)}
      </StyledLabel>
      <StyledLabel frontColor={frontColor}>#{id}</StyledLabel>
    </Container>
  );
};

export default PeriodBanner;
