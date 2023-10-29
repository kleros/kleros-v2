import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import WithHelpTooltip from "pages/Dashboard/WithHelpTooltip";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  background-color: transparent;
  padding: 24px;
  flex-wrap: wrap;

  ${landscapeStyle(
    () =>
      css`
        flex-wrap: nowrap;
        gap: 0px;
        padding: 23.15px 32px;
      `
  )}
`;

const CourtName = styled.div`
  width: 100%;

  ${landscapeStyle(() => css``)}
`;

const StakesContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${landscapeStyle(
    () =>
      css`
        width: 206px;
      `
  )}
`;

const Stake = styled.div`
  display: flex;
  width: 69px;
`;

const LockedStake = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 112px;
`;

const lockedStakeTooltipMsg =
  "When a juror is selected to arbitrate a case, part of their stake (PNK) is " +
  "locked until the case is resolved. Jurors whose vote is coherent with the " +
  "final jury decision have their locked stake released. Jurors whose vote " +
  "is not coherent with the final jury decision, lose their locked stake. " +
  "The locked stake of incoherent jurors is redistributed as incentives for " +
  "the coherent jurors.";

const Header: React.FC = () => {
  return (
    <Container>
      <CourtName>
        <label>Court Name</label>
      </CourtName>
      <StakesContainer>
        <Stake>
          <label> Stake </label>
        </Stake>
        <LockedStake>
          <WithHelpTooltip place="left" tooltipMsg={lockedStakeTooltipMsg}>
            <label> Locked Stake </label>
          </WithHelpTooltip>
        </LockedStake>
      </StakesContainer>
    </Container>
  );
};

export default Header;
