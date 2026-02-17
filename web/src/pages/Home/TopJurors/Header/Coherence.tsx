import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";

import useIsDesktop from "hooks/useIsDesktop";

import { landscapeStyle } from "styles/landscapeStyle";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div<{ content: string }>`
  display: flex;
  font-size: 12px !important;
  &::before {
    content: "${({ content }) => content}";
  }
  color: ${({ theme }) => theme.secondaryText};
  align-items: center;

  ${landscapeStyle(
    () => css`
      font-size: 14px !important;
      justify-content: center;
    `
  )}
`;

const Coherence: React.FC = () => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const text = t("juror_levels.coherent_votes").replace(/ /g, "\u00A0");

  return (
    <Container content={text}>
      <WithHelpTooltip
        place={isDesktop ? "top" : "right"}
        tooltipMsg={t("juror_levels.coherent_votes_ratio_tooltip")}
      ></WithHelpTooltip>
    </Container>
  );
};
export default Coherence;
