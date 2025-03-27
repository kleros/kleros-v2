import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import useIsDesktop from "hooks/useIsDesktop";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  font-size: 12px !important;
  &::before {
    content: "Coherent\u00a0Votes";
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

const coherentVotesTooltipMsg =
  "This is the ratio of coherent votes made by a juror: " +
  "the number in the left is the number of times where the juror " +
  "voted coherently and the number in the right is the total number of times " +
  "the juror voted. Hover to see the percentage of coherent votes.";

const Coherence: React.FC = () => {
  const isDesktop = useIsDesktop();

  return (
    <Container>
      <WithHelpTooltip place={isDesktop ? "top" : "right"} tooltipMsg={coherentVotesTooltipMsg}></WithHelpTooltip>
    </Container>
  );
};
export default Coherence;
