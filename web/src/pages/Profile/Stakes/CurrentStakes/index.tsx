import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";

import Skeleton from "react-loading-skeleton";

import { JurorStakeDetailsQuery } from "src/graphql/graphql";

import Header from "./Header";
import CourtCard from "../CourtCard";
import { CourtCardsContainer } from "../index";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;

const NoCurrentStakesLabel = styled.label`
  font-size: ${responsiveSize(14, 16)};
  margin-bottom: 12px;
`;

interface ICurrentStakes {
  totalStake: string;
  lockedStake: string;
  currentStakeData: JurorStakeDetailsQuery | undefined;
  isLoading: boolean;
}

const CurrentStakes: React.FC<ICurrentStakes> = ({ totalStake, lockedStake, currentStakeData, isLoading }) => {
  const stakedCourts = currentStakeData?.jurorTokensPerCourts?.filter(({ staked }) => staked > 0);
  const isStaked = stakedCourts && stakedCourts.length > 0;

  return (
    <Container>
      <Header {...{ totalStake, lockedStake }} />
      {!isStaked && !isLoading ? (
        <NoCurrentStakesLabel>No stakes found</NoCurrentStakesLabel>
      ) : isLoading ? (
        <Skeleton />
      ) : null}
      {isStaked && !isLoading ? (
        <CourtCardsContainer>
          {currentStakeData?.jurorTokensPerCourts
            ?.filter(({ staked }) => staked > 0)
            .map(({ court: { id, name }, staked }) => (
              <CourtCard key={id} name={name ?? ""} stake={staked} {...{ id }} />
            ))}
        </CourtCardsContainer>
      ) : null}
    </Container>
  );
};
export default CurrentStakes;
