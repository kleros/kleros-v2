import React from "react";
import styled from "styled-components";
import { CircularProgress } from "@kleros/ui-components-library";
import WithHelpTooltip from "../WithHelpTooltip";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const tooltipMsg =
  "A Coherent Vote is a vote coherent with the final jury decision" +
  " (after all the appeal instances). If the juror vote is the same as the" +
  " majority of jurors it's considered a Coherent Vote.";

const Coherency: React.FC = () => {
  return (
    <Container>
      <small>Aristotle</small>
      <label>Level 4</label>
      <CircularProgress progress={90} />
      <WithHelpTooltip place="bottom" {...{ tooltipMsg }}>
        <label>
          Coherent votes: <small>9/10</small>
        </label>
      </WithHelpTooltip>
    </Container>
  );
};

export default Coherency;
