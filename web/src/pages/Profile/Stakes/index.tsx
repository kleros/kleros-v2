import React from "react";
import styled, { css } from "styled-components";

import { useReadSortitionModuleGetJurorBalance } from "hooks/contracts/generated";

import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import { landscapeStyle } from "styles/landscapeStyle";
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
  const { data: currentStakeData, isLoading: isCurrentStakeLoading } = useJurorStakeDetailsQuery(searchParamAddress);
  const { data: jurorBalance } = useReadSortitionModuleGetJurorBalance({
    args: [searchParamAddress, BigInt(1)],
  });
  const totalAvailableStake = jurorBalance?.[0];
  const lockedStake = jurorBalance?.[1];

  return (
    <Container>
      <CurrentStakes {...{ totalAvailableStake, lockedStake, currentStakeData, isCurrentStakeLoading }} />
      <StakingHistory {...{ searchParamAddress }} />
    </Container>
  );
};

export default Stakes;
