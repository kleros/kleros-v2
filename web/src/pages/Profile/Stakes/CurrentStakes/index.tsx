import React from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";

import { JurorStakeDetailsQuery } from "src/graphql/graphql";

import { responsiveSize } from "styles/responsiveSize";

import CourtCard from "../CourtCard";
import { CourtCardsContainer } from "../index";

import Header from "./Header";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;

const NoCurrentStakesLabel = styled.label`
  font-size: ${responsiveSize(14, 16)};
`;

interface ICurrentStakes {
  totalAvailableStake: string;
  lockedStake: string;
  currentStakeData: JurorStakeDetailsQuery | undefined;
  isCurrentStakeLoading: boolean;
}

const CurrentStakes: React.FC<ICurrentStakes> = ({
  totalAvailableStake,
  lockedStake,
  currentStakeData,
  isCurrentStakeLoading,
}) => {
  const stakedCourts = currentStakeData?.jurorTokensPerCourts?.filter(({ staked }) => staked > 0);
  const isStaked = stakedCourts && stakedCourts.length > 0;

  return (
    <Container>
      <Header {...{ totalAvailableStake, lockedStake }} />
      {!isStaked && !isCurrentStakeLoading ? (
        <NoCurrentStakesLabel>No stakes found</NoCurrentStakesLabel>
      ) : isCurrentStakeLoading ? (
        <Skeleton />
      ) : null}
      {isStaked && !isCurrentStakeLoading ? (
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
