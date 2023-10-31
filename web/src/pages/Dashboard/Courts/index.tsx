import React from "react";
import styled from "styled-components";
import { useAccount } from "wagmi";
import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";
import Skeleton from "react-loading-skeleton";
import CourtCard from "./CourtCard";
import Header from "./Header";

const Container = styled.div`
  margin-top: 64px;

  h1 {
    margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  }
`;

const Divider = styled.hr`
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
`;

const CourtCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 0;
`;

const StyledLabel = styled.label`
  font-size: 16px;
`;

const Courts: React.FC = () => {
  const { address } = useAccount();
  const { data: stakeData, isLoading } = useJurorStakeDetailsQuery(address?.toLowerCase() as `0x${string}`);
  const stakedCourts = stakeData?.jurorTokensPerCourts?.filter(({ staked, locked }) => staked > 0 || locked > 0);
  const isStaked = stakedCourts && stakedCourts.length > 0;

  return (
    <Container>
      <h1> My Courts </h1>
      {isLoading ? <Skeleton /> : null}
      {!isStaked && !isLoading ? <StyledLabel>You are not staked in any court</StyledLabel> : null}
      {isStaked && !isLoading ? (
        <>
          <Divider />
          <Header />
          <CourtCardsContainer>
            {stakeData?.jurorTokensPerCourts
              ?.filter(({ staked, locked }) => staked > 0 || locked > 0)
              .map(({ court: { id, name }, staked, locked }) => (
                <CourtCard key={id} name={name ?? ""} stake={staked} lockedStake={locked} />
              ))}
          </CourtCardsContainer>
        </>
      ) : null}
    </Container>
  );
};

export default Courts;
