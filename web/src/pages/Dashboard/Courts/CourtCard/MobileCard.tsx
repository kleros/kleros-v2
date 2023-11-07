import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card as _Card } from "@kleros/ui-components-library";
import CourtBranch from "./CourtBranch";
import HeaderStake from "../Header/Stake";
import HeaderLockedStake from "../Header/LockedStake";
import Stake from "./Stake";
import LockedStake from "./LockedStake";

const Container = styled(_Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
  width: 100%;
  padding: 24px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
  flex-wrap: wrap;
  gap: 18px;

  ${({ theme }) => (theme.name === "light" ? `box-shadow: 0px 2px 3px 0px ${theme.stroke};` : "")}

  ${landscapeStyle(
    () =>
      css`
        display: none;
      `
  )}
`;

const BottomSide = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const HeaderStakeAndStake = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 5px;
  justify-content: flex-start;
`;

const HeaderLockedStakeAndLockedStake = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 5px;
  justify-content: flex-end;
`;

interface IMobileCard {
  name: string;
  stake: bigint;
  lockedStake: bigint;
}

const MobileCard: React.FC<IMobileCard> = ({ name, stake, lockedStake }) => {
  return (
    <Container>
      <CourtBranch name={name} />
      <BottomSide>
        <HeaderStakeAndStake>
          <HeaderStake />
          <Stake stake={stake} />
        </HeaderStakeAndStake>
        <HeaderLockedStakeAndLockedStake>
          <HeaderLockedStake />
          <LockedStake lockedStake={lockedStake} />
        </HeaderLockedStakeAndLockedStake>
      </BottomSide>
    </Container>
  );
};

export default MobileCard;
