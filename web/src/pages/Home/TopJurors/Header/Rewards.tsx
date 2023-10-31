import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import WithHelpTooltip from "pages/Dashboard/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  color: ${({ theme }) => theme.secondaryText};

  font-size: 12px !important;
  &::before {
    content: "Rewards";
  }

  ${landscapeStyle(
    () =>
      css`
        width: calc(60px + (240 - 60) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

        font-size: 14px !important;
        &::before {
          content: "Total Rewards";
        }
      `
  )}
`;

const totalRewardsTooltipMsg =
  "Users have an economic interest in serving as jurors in Kleros: " +
  "collecting the Juror Rewards in exchange for their work. Each juror who " +
  "is coherent with the final ruling receive the Juror Rewards composed of " +
  "arbitration fees (ETH) + PNK redistribution between jurors.";

const Rewards: React.FC = () => (
  <Container>
    <WithHelpTooltip place="top" tooltipMsg={totalRewardsTooltipMsg}></WithHelpTooltip>
  </Container>
);

export default Rewards;
