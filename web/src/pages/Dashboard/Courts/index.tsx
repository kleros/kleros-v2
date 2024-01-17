import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useAccount } from "wagmi";
import Skeleton from "react-loading-skeleton";
import CourtCard from "./CourtCard";
import Header from "./Header";
import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";
import { useSortitionModuleGetJurorBalance } from "hooks/contracts/generated";

const Container = styled.div`
  margin-top: 64px;
`;

const CourtCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 0;

  ${landscapeStyle(
    () => css`
      gap: 16px;
    `
  )}
`;

const StyledLabel = styled.label`
  font-size: 16px;
`;

const Courts: React.FC = () => {
  const { address } = useAccount();
  const { data: stakeData, isLoading } = useJurorStakeDetailsQuery(address?.toLowerCase() as `0x${string}`);
  const { data: jurorBalance } = useSortitionModuleGetJurorBalance({
    args: [address as `0x${string}`, BigInt(1)],
  });
  const stakedCourts = stakeData?.jurorTokensPerCourts?.filter(({ staked }) => staked > 0);
  const isStaked = stakedCourts && stakedCourts.length > 0;
  const lockedStake = jurorBalance?.[1];

  return (
    <Container>
      <Header lockedStake={lockedStake ?? BigInt(0)} />
      {isLoading ? <Skeleton /> : null}
      {!isStaked && !isLoading ? <StyledLabel>You are not staked in any court</StyledLabel> : null}
      {isStaked && !isLoading ? (
        <CourtCardsContainer>
          {stakeData?.jurorTokensPerCourts
            ?.filter(({ staked }) => staked > 0)
            .map(({ court: { id, name }, staked }) => (
              <CourtCard key={id} name={name ?? ""} stake={staked} />
            ))}
        </CourtCardsContainer>
      ) : null}
    </Container>
  );
};

export default Courts;
