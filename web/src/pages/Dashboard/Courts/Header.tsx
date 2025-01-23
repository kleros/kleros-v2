import React from "react";
import styled, { css } from "styled-components";

import { formatUnits } from "viem";
import { useSearchParams } from "react-router-dom";

import LockerIcon from "svgs/icons/locker.svg";

import { isUndefined } from "utils/index";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import NumberDisplay from "components/NumberDisplay";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  gap: 4px 16px;
  align-items: center;
  margin-bottom: ${responsiveSize(16, 24)};

  ${landscapeStyle(
    () => css`
      justify-content: space-between;
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
  font-size: ${responsiveSize(20, 24)};
`;

const StyledLockerIcon = styled(LockerIcon)`
  fill: ${({ theme }) => theme.secondaryPurple};
  width: 14px;
`;

interface IHeader {
  lockedStake: bigint;
}

const Header: React.FC<IHeader> = ({ lockedStake }) => {
  const formattedLockedStake = !isUndefined(lockedStake) && formatUnits(lockedStake, 18);
  const [searchParams] = useSearchParams();
  const searchParamAddress = searchParams.get("address")?.toLowerCase();

  return (
    <Container>
      <StyledTitle>{searchParamAddress ? "Their" : "My"} Courts</StyledTitle>
      {!isUndefined(lockedStake) ? (
        <LockedPnk>
          <StyledLockerIcon />
          <label> Locked Stake: </label>
          <small>
            <NumberDisplay value={formattedLockedStake.toString()} unit="PNK" />
          </small>
        </LockedPnk>
      ) : null}
    </Container>
  );
};
export default Header;
