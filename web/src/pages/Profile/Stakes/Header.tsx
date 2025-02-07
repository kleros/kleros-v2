import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { formatUnits } from "viem";

import PnkIcon from "svgs/icons/pnk.svg";
import LockerIcon from "svgs/icons/locker.svg";

import { isUndefined } from "utils/index";

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

const StakedPnk = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const LockedPnk = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledTitle = styled.h1`
  margin-bottom: 0;
  font-size: ${responsiveSize(20, 24)};
`;

const TotalStakeAndLockedPnk = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px 24px;
  flex-wrap: wrap;
`;

const StyledPnkIcon = styled(PnkIcon)`
  fill: ${({ theme }) => theme.secondaryPurple};
  width: 14px;
`;

const StyledLockerIcon = styled(LockerIcon)`
  fill: ${({ theme }) => theme.secondaryPurple};
  width: 14px;
`;

interface IHeader {
  totalStake: string;
  lockedStake: string;
}

const Header: React.FC<IHeader> = ({ totalStake, lockedStake }) => {
  const formattedTotalStake = formatUnits(BigInt(totalStake), 18);
  const formattedLockedStake = formatUnits(BigInt(lockedStake), 18);

  return (
    <Container>
      <StyledTitle>Stakes</StyledTitle>
      <TotalStakeAndLockedPnk>
        {!isUndefined(totalStake) ? (
          <StakedPnk>
            <StyledPnkIcon />
            <label> Total Stake: </label>
            <small>
              <NumberDisplay value={formattedTotalStake} unit="PNK" />
            </small>
          </StakedPnk>
        ) : null}
        {!isUndefined(lockedStake) ? (
          <LockedPnk>
            <StyledLockerIcon />
            <label> Locked Stake: </label>
            <small>
              <NumberDisplay value={formattedLockedStake} unit="PNK" />
            </small>
          </LockedPnk>
        ) : null}
      </TotalStakeAndLockedPnk>
    </Container>
  );
};
export default Header;
