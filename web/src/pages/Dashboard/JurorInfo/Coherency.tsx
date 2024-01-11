import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { CircularProgress } from "@kleros/ui-components-library";
import WithHelpTooltip from "components/WithHelpTooltip";

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
  " (after all the appeal instances). If the juror vote is the same as " +
  " the majority of jurors it's considered a Coherent Vote.";

interface ICoherency {
  userLevelData: {
    level: number;
    title: string;
  };
  totalCoherent: number;
  totalResolvedDisputes: number;
  isMiniGuide: boolean;
}

const Coherency: React.FC<ICoherency> = ({ userLevelData, totalCoherent, totalResolvedDisputes, isMiniGuide }) => {
  const votesContent = (
    <label>
      Coherent Votes:
      <small>
        {" "}
        {totalCoherent}/{totalResolvedDisputes}{" "}
      </small>
    </label>
  );

  return (
    <Container>
      <small>{userLevelData.title}</small>
      <label>Level {userLevelData.level}</label>
      <CircularProgress
        progress={parseFloat(((totalCoherent / Math.max(totalResolvedDisputes, 1)) * 100).toFixed(2))}
      />
      {!isMiniGuide ? (
        <WithHelpTooltip place="left" {...{ tooltipMsg }}>
          {votesContent}
        </WithHelpTooltip>
      ) : (
        votesContent
      )}
    </Container>
  );
};

export default Coherency;
