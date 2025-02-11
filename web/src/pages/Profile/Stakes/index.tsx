import React from "react";
import styled, { css } from "styled-components";

import { landscapeStyle } from "styles/landscapeStyle";
import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";
import { useStakingHistory } from "queries/useStakingHistory";

import { responsiveSize } from "styles/responsiveSize";

import CurrentStakes from "./CurrentStakes";
import StakingHistory from "./StakingHistory";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${responsiveSize(24, 32)};
  gap: 32px;
`;

export const CourtCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 0;
  width: 100%;

  ${landscapeStyle(
    () => css`
      gap: 8px;
    `
  )}
`;

interface IStakes {
  searchParamAddress: `0x${string}`;
}

const Stakes: React.FC<IStakes> = ({ searchParamAddress }) => {
  const { data: currentStakeData, isLoading } = useJurorStakeDetailsQuery(searchParamAddress);
  const { data: stakingHistoryData } = useStakingHistory(1, 0);
  const totalStake = currentStakeData?.jurorTokensPerCourts?.[0]?.effectiveStake ?? "0";
  const lockedStake = currentStakeData?.jurorTokensPerCourts?.[0]?.locked ?? "0";
  const totalNumberStakingEvents = stakingHistoryData?.data?.userStakingEvents?.count ?? 0;

  return (
    <Container>
      <CurrentStakes {...{ totalStake, lockedStake, currentStakeData, isLoading }} />
      <StakingHistory {...{ searchParamAddress, totalNumberStakingEvents }} />
    </Container>
  );
};

export default Stakes;
