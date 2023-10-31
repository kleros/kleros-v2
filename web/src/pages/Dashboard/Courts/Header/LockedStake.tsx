import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import WithHelpTooltip from "pages/Dashboard/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 110px;

  ${landscapeStyle(() => css``)}
`;

const StyledLockedStakeLabel = styled.label`
  display: flex;
  flex-wrap: nowrap;
`;

const lockedStakeTooltipMsg =
  "When a juror is selected to arbitrate a case, part of their stake (PNK) is " +
  "locked until the case is resolved. Jurors whose vote is coherent with the " +
  "final jury decision have their locked stake released. Jurors whose vote " +
  "is not coherent with the final jury decision, lose their locked stake. " +
  "The locked stake of incoherent jurors is redistributed as incentives for " +
  "the coherent jurors.";

const LockedStake: React.FC = () => {
  return (
    <Container>
      <WithHelpTooltip place="left" tooltipMsg={lockedStakeTooltipMsg}>
        <StyledLockedStakeLabel> Locked Stake </StyledLockedStakeLabel>
      </WithHelpTooltip>
    </Container>
  );
};
export default LockedStake;
