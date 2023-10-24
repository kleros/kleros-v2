import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { CircularProgress } from "@kleros/ui-components-library";
import WithHelpTooltip from "../WithHelpTooltip";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  ${landscapeStyle(
    () => css`
      gap: 0;
    `
  )}
`;

const tooltipMsg =
  "A Coherent Vote is a vote coherent with the final jury decision" +
  " (after all the appeal instances). Your coherency score is calculated" +
  " using the number of times you have been coherent and the total cases you" +
  " have been in.";

interface ICoherency {
  userLevelData: {
    scoreRange: number[];
    level: number;
    title: string;
  };
  score: number;
}

const Coherency: React.FC<ICoherency> = ({ userLevelData, score }) => {
  return (
    <Container>
      <small>{userLevelData.title}</small>
      <label>Level {userLevelData.level}</label>
      <CircularProgress progress={parseFloat(score.toFixed(2))} />
      <WithHelpTooltip place="left" {...{ tooltipMsg }}>
        <label>
          Coherency Score:
          <small> {score.toFixed(2)} </small>
        </label>
      </WithHelpTooltip>
    </Container>
  );
};

export default Coherency;
