import React, { useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

import Check from "svgs/icons/check-circle-outline.svg";

import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { commify, uncommify } from "utils/commify";

import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import { isUndefined } from "src/utils";

import WithHelpTooltip from "components/WithHelpTooltip";

import QuantityToSimulate, { Quantity, TextWithTooltipContainer } from "../Simulator/QuantityToSimulate";
import { ActionType } from "../StakeWithdrawButton";

const StakingMsgContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
  align-items: center;
`;

const StakingMsg = styled.h1`
  font-weight: 400;
  margin: 0;
  padding: 0;
  text-align: center;
`;

const StakingAmount = styled(StakingMsg)`
  font-weight: 600;
  color: ${({ theme }) => theme.secondaryPurple};
  text-align: center;
`;

const CheckIcon = styled(Check)`
  path {
    fill: ${({ theme }) => theme.success};
  }
  width: 80px;
  height: 80px;
`;

const CourtName = styled.label`
  margin-bottom: 15px;
`;

const QuantityContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

interface IHeader {
  action: ActionType;
  amount: string;
  isSuccess: boolean;
}

const Header: React.FC<IHeader> = ({ action, amount, isSuccess }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: courtDetails } = useCourtDetails(id);
  const { address } = useAccount();
  const { data: stakeData } = useJurorStakeDetailsQuery(address?.toLowerCase() as `0x${string}`);
  const jurorStakeData = stakeData?.jurorTokensPerCourts?.find(({ court }) => court.id === id);
  const jurorCurrentEffectiveStake = address && jurorStakeData ? Number(formatEther(jurorStakeData.effectiveStake)) : 0;
  const jurorCurrentSpecificStake = address && jurorStakeData ? Number(formatEther(jurorStakeData.staked)) : 0;

  const effectiveStakeDisplay = !isUndefined(jurorCurrentEffectiveStake) ? (
    `${commify(jurorCurrentEffectiveStake)} PNK`
  ) : (
    <Skeleton width={50} />
  );

  const isWithdraw = action === ActionType.withdraw;

  const stakingMessage = useMemo(() => {
    if (isSuccess) {
      return isWithdraw ? t("staking.you_successfully_withdrew") : t("staking.you_successfully_staked");
    }
    return isWithdraw ? t("staking.you_are_withdrawing") : t("staking.you_are_staking");
  }, [isSuccess, isWithdraw, t]);

  return (
    <StakingMsgContainer>
      {isSuccess ? <CheckIcon /> : null}
      <StakingMsg>{stakingMessage}</StakingMsg>
      <StakingAmount>{amount} PNK</StakingAmount>
      {courtDetails?.court?.name ? (
        <CourtName>{t("staking.on_court", { court: courtDetails.court.name })}</CourtName>
      ) : null}
      {isSuccess ? (
        <QuantityContainer>
          <Quantity>{effectiveStakeDisplay}</Quantity>
          <TextWithTooltipContainer>
            <WithHelpTooltip tooltipMsg={t("staking.stake_confirmed_tooltip")}>
              {t("staking.current_stake")}
            </WithHelpTooltip>
          </TextWithTooltipContainer>{" "}
        </QuantityContainer>
      ) : (
        <QuantityToSimulate
          {...{
            jurorCurrentEffectiveStake,
            jurorCurrentSpecificStake,
            isStaking: !isWithdraw,
            amountToStake: Number(uncommify(amount)),
          }}
        />
      )}
    </StakingMsgContainer>
  );
};

export default Header;
