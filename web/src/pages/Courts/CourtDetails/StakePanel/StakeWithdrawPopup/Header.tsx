import React, { useMemo } from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

import Check from "svgs/icons/check-circle-outline.svg";

import { useCourtDetails } from "hooks/queries/useCourtDetails";
import { uncommify } from "utils/commify";

import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import QuantityToSimulate from "../SimulatorPopup/QuantityToSimulate";
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

const CourtName = styled.label``;

const StyledQuantityToSimulate = styled(QuantityToSimulate)`
  margin-top: 15px;
`;
interface IHeader {
  action: ActionType;
  amount: string;
  isSuccess: boolean;
}

const Header: React.FC<IHeader> = ({ action, amount, isSuccess }) => {
  const { id } = useParams();
  const { data: courtDetails } = useCourtDetails(id);
  const { address } = useAccount();
  const { data: stakeData } = useJurorStakeDetailsQuery(address?.toLowerCase() as `0x${string}`);
  const jurorStakeData = stakeData?.jurorTokensPerCourts?.find(({ court }) => court.id === id);
  const jurorCurrentEffectiveStake = address && jurorStakeData ? Number(formatEther(jurorStakeData.effectiveStake)) : 0;
  const jurorCurrentSpecificStake = address && jurorStakeData ? Number(formatEther(jurorStakeData.staked)) : 0;

  const isWithdraw = action === ActionType.withdraw;
  const actionText = useMemo(() => (isWithdraw ? "withdrew" : "staked"), [isWithdraw]);
  return (
    <StakingMsgContainer>
      {isSuccess ? <CheckIcon /> : null}
      <StakingMsg>{isSuccess ? `You successfully ${actionText}` : `You are ${actionText}`}</StakingMsg>
      <StakingAmount>{amount} PNK</StakingAmount>
      {courtDetails?.court?.name ? <CourtName>on {courtDetails.court.name}</CourtName> : null}
      {isSuccess ? null : (
        <StyledQuantityToSimulate
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
