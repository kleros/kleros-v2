import React from "react";
import styled, { css } from "styled-components";
import { BREAKPOINT_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { useWindowSize } from "react-use";
import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  font-size: 12px !important;
  &::before {
    content: "Votes";
  }
  color: ${({ theme }) => theme.secondaryText};
  align-items: center;

  ${landscapeStyle(
    () =>
      css`
        font-size: 14px !important;
        justify-content: center;
        &::before {
          content: "Coherent Votes";
        }
      `
  )}
`;

const coherentVotesTooltipMsg =
  "This is the ratio of coherent votes made by a juror: " +
  "the number in the left is the number of times where the juror " +
  "voted coherently and the number in the right is the total number of times " +
  "the juror voted";

const Coherency: React.FC = () => {
  const { width } = useWindowSize();
  return (
    <Container>
      <WithHelpTooltip
        place={width > BREAKPOINT_LANDSCAPE ? "top" : "left"}
        tooltipMsg={coherentVotesTooltipMsg}
      ></WithHelpTooltip>
    </Container>
  );
};
export default Coherency;
