import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import WithHelpTooltip from "components/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  color: ${({ theme }) => theme.secondaryText};
  gap: 0px;

  font-size: 12px !important;
  &::before {
    content: "Rewards";
  }

  ${landscapeStyle(
    () =>
      css`
        font-size: 14px !important;
        justify-content: center;
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
