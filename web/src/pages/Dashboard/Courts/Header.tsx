import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { formatUnits } from "viem";
import { isUndefined } from "utils/index";
import LockerIcon from "svgs/icons/locker.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: calc(32px + (48 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);

  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )}
`;

const LockedPnk = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: flex-start;

  ${landscapeStyle(
    () => css`
      align-self: center;
    `
  )}
`;

const StyledTitle = styled.h1`
  margin-bottom: 0;
`;

const StyledLockerIcon = styled(LockerIcon)`
  fill: ${({ theme }) => theme.secondaryPurple};
  width: 14px;
`;

interface IHeader {
  lockedStake: string;
}

const Header: React.FC<IHeader> = ({ lockedStake }) => {
  const formattedLockedStake = !isUndefined(lockedStake) && formatUnits(lockedStake, 18);

  return (
    <Container>
      <StyledTitle>My Courts</StyledTitle>
      {!isUndefined(lockedStake) ? (
        <LockedPnk>
          <StyledLockerIcon />
          <label> Locked Stake: </label>
          <small>{`${formattedLockedStake} PNK`}</small>
        </LockedPnk>
      ) : null}
    </Container>
  );
};
export default Header;
