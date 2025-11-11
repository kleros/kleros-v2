import React, { useMemo } from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { formatEther } from "viem";

import Check from "svgs/icons/check-circle-outline.svg";

import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { commify, uncommify } from "utils/commify";

import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import { isUndefined } from "src/utils";

import WithHelpTooltip from "components/WithHelpTooltip";

import { useWallet } from "context/walletProviders";
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
  const { id } = useParams();
  const { data: courtDetails } = useCourtDetails(id);
  const { account } = useWallet();
  const { data: stakeData } = useJurorStakeDetailsQuery(account?.toLowerCase() as `0x${string}`);
  const jurorStakeData = stakeData?.jurorTokensPerCourts?.find(({ court }) => court.id === id);
  const jurorCurrentEffectiveStake = account && jurorStakeData ? Number(formatEther(jurorStakeData.effectiveStake)) : 0;
  const jurorCurrentSpecificStake = account && jurorStakeData ? Number(formatEther(jurorStakeData.staked)) : 0;

  const effectiveStakeDisplay = !isUndefined(jurorCurrentEffectiveStake) ? (
    `${commify(jurorCurrentEffectiveStake)} PNK`
  ) : (
    <Skeleton width={50} />
  );

  const isWithdraw = action === ActionType.withdraw;
  const preStakeText = useMemo(() => (isWithdraw ? "withdrawing" : "staking"), [isWithdraw]);
  const postStakeText = useMemo(() => (isWithdraw ? "withdrew" : "staked"), [isWithdraw]);

  return (
    <StakingMsgContainer>
      {isSuccess ? <CheckIcon /> : null}
      <StakingMsg>{isSuccess ? `You successfully ${postStakeText}` : `You are ${preStakeText}`}</StakingMsg>
      <StakingAmount>{amount} PNK</StakingAmount>
      {courtDetails?.court?.name ? <CourtName>on {courtDetails.court.name}</CourtName> : null}
      {isSuccess ? (
        <QuantityContainer>
          <Quantity>{effectiveStakeDisplay}</Quantity>
          <TextWithTooltipContainer>
            <WithHelpTooltip tooltipMsg="The stake is confirmed! It is standard procedure to delay the execution of a change in stakes if the phase of the arbitrator is not currently Staking. It'll be updated shortly.">
              Current Stake
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
