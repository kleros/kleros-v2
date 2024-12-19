import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";

import useIsDesktop from "hooks/useIsDesktop";

import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  font-size: 12px !important;
  &::before {
    content: "Coherence";
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
  "This is the percentage of coherent votes made by a juror." +
  " Hover to see the ratio of coherent votes: " +
  "the number in the left is the number of times where the juror " +
  "voted coherently and the number in the right is the total number of times " +
  "the juror voted";

const Coherence: React.FC = () => {
  const isDesktop = useIsDesktop();

  return (
    <Container>
      <WithHelpTooltip place={isDesktop ? "top" : "left"} tooltipMsg={coherentVotesTooltipMsg}></WithHelpTooltip>
    </Container>
  );
};
export default Coherence;
