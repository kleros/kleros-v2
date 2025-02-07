import React from "react";
import styled, { css } from "styled-components";

import Skeleton from "react-loading-skeleton";

import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import CourtCard from "./CourtCard";
import Header from "./Header";

const Container = styled.div`
  margin-top: ${responsiveSize(24, 32)};
`;

const CourtCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 0;

  ${landscapeStyle(
    () => css`
      gap: 8px;
    `
  )}
`;

const StyledLabel = styled.label`
  font-size: ${responsiveSize(14, 16)};
`;

interface IStakes {
  searchParamAddress: `0x${string}`;
}

const Stakes: React.FC<IStakes> = ({ searchParamAddress }) => {
  const { data: stakeData, isLoading } = useJurorStakeDetailsQuery(searchParamAddress);
  const stakedCourts = stakeData?.jurorTokensPerCourts?.filter(({ staked }) => staked > 0);
  const isStaked = stakedCourts && stakedCourts.length > 0;
  const totalStake = stakeData?.jurorTokensPerCourts?.[0]?.effectiveStake ?? "0";
  const lockedStake = stakeData?.jurorTokensPerCourts?.[0]?.locked ?? "0";

  return (
    <Container>
      <Header {...{ totalStake, lockedStake }} />
      {isLoading ? <Skeleton /> : null}
      {!isStaked && !isLoading ? <StyledLabel>No stakes found</StyledLabel> : null}
      {isStaked && !isLoading ? (
        <CourtCardsContainer>
          {stakeData?.jurorTokensPerCourts
            ?.filter(({ staked }) => staked > 0)
            .map(({ court: { id, name }, staked }) => (
              <CourtCard key={id} name={name ?? ""} stake={staked} {...{ id }} />
            ))}
        </CourtCardsContainer>
      ) : null}
    </Container>
  );
};

export default Stakes;
