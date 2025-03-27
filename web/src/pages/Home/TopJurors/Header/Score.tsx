import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import useIsDesktop from "hooks/useIsDesktop";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  font-size: 12px !important;
  &::before {
    content: "Score";
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

const scoreTooltipMsg =
  "A score from 0 to 100 reflecting coherent voting, smoothed " +
  "to prevent jurors with low vote counts from ranking too high.";

const Score: React.FC = () => {
  const isDesktop = useIsDesktop();

  return (
    <Container>
      <WithHelpTooltip place={isDesktop ? "top" : "right"} tooltipMsg={scoreTooltipMsg}></WithHelpTooltip>
    </Container>
  );
};
export default Score;
