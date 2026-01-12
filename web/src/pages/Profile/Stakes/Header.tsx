import React from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
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
  align-items: center;
  justify-content: center;
`;

const StakesGroup = styled.div`
  display: flex;
  gap: 12px 24px;
  align-items: center;
  flex-wrap: wrap;
`;

const AvailablePnk = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const EffectivePnk = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const StyledTitle = styled.h1`
  margin-bottom: 0;
  font-size: ${responsiveSize(20, 24)};
`;

const StyledLockerIcon = styled(LockerIcon)`
  fill: ${({ theme }) => theme.secondaryPurple};
  width: 14px;
  height: 14px;
  margin-bottom: 1px;
`;

const StyledPnkIcon = styled(PnkIcon)`
  fill: ${({ theme }) => theme.secondaryPurple};
  width: 14px;
  height: 14px;
  margin-bottom: 1px;
`;

const StyledEffectivePnkIcon = styled(PnkIcon)`
  fill: ${({ theme }) => theme.secondaryPurple};
  width: 14px;
  height: 14px;
  margin-bottom: 1px;
`;

interface IHeader {
  availableStake?: bigint;
  lockedStake?: bigint;
  effectiveStake?: bigint;
}

const Header: React.FC<IHeader> = ({ availableStake, lockedStake, effectiveStake }) => {
  const { t } = useTranslation();
  const formattedAvailableStake = !isUndefined(availableStake) && formatUnits(availableStake, 18);
  const formattedLockedStake = !isUndefined(lockedStake) && formatUnits(lockedStake, 18);
  const formattedEffectiveStake = !isUndefined(effectiveStake) && formatUnits(effectiveStake, 18);
  const [searchParams] = useSearchParams();
  const searchParamAddress = searchParams.get("address")?.toLowerCase();

  return (
    <Container>
      <StyledTitle>{searchParamAddress ? t("profile.their_stakes") : t("profile.my_stakes")}</StyledTitle>
      <StakesGroup>
        {!isUndefined(availableStake) ? (
          <AvailablePnk>
            <StyledPnkIcon />
            <label> {t("profile.available")} </label>
            <small>
              <NumberDisplay value={formattedAvailableStake.toString()} unit="PNK" />
            </small>
          </AvailablePnk>
        ) : null}
        {!isUndefined(effectiveStake) ? (
          <EffectivePnk>
            <StyledEffectivePnkIcon />
            <label> {t("profile.staked")} </label>
            <small>
              <NumberDisplay value={formattedEffectiveStake.toString()} unit="PNK" />
            </small>
          </EffectivePnk>
        ) : null}
        {!isUndefined(lockedStake) ? (
          <LockedPnk>
            <StyledLockerIcon />
            <label> {t("profile.locked")} </label>
            <small>
              <NumberDisplay value={formattedLockedStake.toString()} unit="PNK" />
            </small>
          </LockedPnk>
        ) : null}
      </StakesGroup>
    </Container>
  );
};

export default Header;
