import React from "react";
import styled from "styled-components";
import WithHelpTooltip from "pages/Dashboard/WithHelpTooltip";

const Container = styled.div``;

const coherentVotesTooltipMsg =
  "This is the ratio of coherent votes made by a juror: " +
  "the number in the left is the number of times where the juror " +
  "voted coherently and the number in the right is the total number of times " +
  "the juror voted";

const Coherency: React.FC = () => (
  <Container>
    <WithHelpTooltip place="top" tooltipMsg={coherentVotesTooltipMsg}>
      <label> Coherent Votes </label>
    </WithHelpTooltip>
  </Container>
);
export default Coherency;
