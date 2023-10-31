import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { formatUnits } from "viem";
import { Card as _Card, Breadcrumb } from "@kleros/ui-components-library";

const Card = styled(_Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: auto;
  width: 100%;
  padding: 21.5px 32px 21.5px 27px;
  border-left: 5px solid ${({ theme }) => theme.secondaryPurple};
  flex-wrap: wrap;
  gap: 20px;

  ${landscapeStyle(
    () =>
      css`
        flex-direction: row;
      `
  )}
`;

const CourtName = styled.div`
  small {
    height: 100%;
  }

  ${landscapeStyle(() => css``)}
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  display: flex;
  align-items: center;
  height: 100%;
`;

const StakesContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${landscapeStyle(() => css``)}
`;

const Stake = styled.div`
  display: flex;
  width: 69px;
  label {
    font-weight: 600;
    color: ${({ theme }) => theme.primaryText};
  }
`;

const LockedStake = styled.div`
  display: flex;
  gap: 8px;
  width: 112px;
  justify-content: flex-end;
  align-items: flex-end;

  label {
    color: ${({ theme }) => theme.primaryText};
  }
`;

interface ICourtCard {
  name: string;
  stake: bigint;
  lockedStake: bigint;
}

const CourtCard: React.FC<ICourtCard> = ({ name, stake, lockedStake }) => {
  const formattedStake = formatUnits(stake, 18);
  const formattedLockedStake = formatUnits(lockedStake, 18);

  return (
    <Card>
      <CourtName>
        <StyledBreadcrumb items={[{ text: name, value: 0 }]} />
      </CourtName>
      <StakesContainer>
        <Stake>
          <label>{`${formattedStake} PNK`}</label>
        </Stake>
        <LockedStake>
          <label>{`${formattedLockedStake} PNK`}</label>
        </LockedStake>
      </StakesContainer>
    </Card>
  );
};

export default CourtCard;
