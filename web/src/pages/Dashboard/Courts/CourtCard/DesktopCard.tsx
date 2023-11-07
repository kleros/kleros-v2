import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import CourtBranch from "./CourtBranch";
import Stake from "./Stake";
import LockedStake from "./LockedStake";

const Container = styled(_Card)`
  display: none;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: auto;
  width: 100%;
  padding: 21.5px 32px 21.5px 27px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
  flex-wrap: wrap;
  gap: 20px;

  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}

  ${landscapeStyle(
    () =>
      css`
        display: flex;
      `
  )}
`;

const StakesContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
`;

interface IDesktopCard {
  name: string;
  stake: bigint;
  lockedStake: bigint;
}

const DesktopCard: React.FC<IDesktopCard> = ({ name, stake, lockedStake }) => {
  return (
    <Container>
      <CourtBranch name={name} />
      <StakesContainer>
        <Stake stake={stake} />
        <LockedStake lockedStake={lockedStake} />
      </StakesContainer>
    </Container>
  );
};

export default DesktopCard;
