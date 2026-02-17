import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { formatUnits } from "viem";

import LockerIcon from "svgs/icons/locker.svg";
import PnkIcon from "svgs/icons/pnk.svg";

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
  margin-bottom: 20px;

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
  width: 16px;
`;

const StyledLockerIcon = styled(LockerIcon)`
  fill: ${({ theme }) => theme.secondaryPurple};
  width: 14px;
`;

interface IHeader {
  totalAvailableStake: string;
  lockedStake: string;
}

const Header: React.FC<IHeader> = ({ totalAvailableStake, lockedStake }) => {
  const { t } = useTranslation();
  const formattedTotalAvailableStake = !isUndefined(totalAvailableStake)
    ? formatUnits(BigInt(totalAvailableStake), 18)
    : "0";
  const formattedLockedStake = !isUndefined(lockedStake) ? formatUnits(BigInt(lockedStake), 18) : "0";

  return (
    <Container>
      <StyledTitle>{t("profile.current_stakes")}</StyledTitle>
      <TotalStakeAndLockedPnk>
        {!isUndefined(totalAvailableStake) ? (
          <StakedPnk>
            <StyledPnkIcon />
            <label> {t("profile.total_available_stake")} </label>
            <small>
              <NumberDisplay value={formattedTotalAvailableStake} unit="PNK" />
            </small>
          </StakedPnk>
        ) : null}
        {!isUndefined(lockedStake) ? (
          <LockedPnk>
            <StyledLockerIcon />
            <label> {t("profile.locked_stake")} </label>
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
