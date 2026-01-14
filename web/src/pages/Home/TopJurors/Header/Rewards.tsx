import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import useIsDesktop from "hooks/useIsDesktop";

import { landscapeStyle } from "styles/landscapeStyle";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div<{ shortLabel: string; longLabel: string }>`
  display: flex;
  color: ${({ theme }) => theme.secondaryText};
  gap: 0px;

  font-size: 12px !important;
  &::before {
    content: "${({ shortLabel }) => shortLabel}";
  }

  ${landscapeStyle(
    () => css`
      font-size: 14px !important;
      justify-content: center;
      &::before {
        content: "${({ longLabel }) => longLabel}";
      }
    `
  )}
`;

const Rewards: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  return (
    <Container shortLabel={t("juror_levels.rewards")} longLabel={t("juror_levels.total_rewards")}>
      <WithHelpTooltip
        place={isDesktop ? "top" : "right"}
        tooltipMsg={t("juror_levels.total_rewards_tooltip")}
      ></WithHelpTooltip>
    </Container>
  );
};

export default Rewards;
