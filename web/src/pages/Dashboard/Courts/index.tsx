import React from "react";
import styled, { css } from "styled-components";

import Skeleton from "react-loading-skeleton";
import { useAccount } from "wagmi";

import { useReadSortitionModuleGetJurorBalance } from "hooks/contracts/generated";

import { useJurorStakeDetailsQuery } from "queries/useJurorStakeDetailsQuery";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import CourtCard from "./CourtCard";
import Header from "./Header";

const Container = styled.div`
  margin-top: ${responsiveSize(24, 48)};
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
  font-size: ${responsiveSize(14, 16)};
`;

const Courts: React.FC = () => {
  const { address } = useAccount();
  const { data: stakeData, isLoading } = useJurorStakeDetailsQuery(address?.toLowerCase() as `0x${string}`);
  const { data: jurorBalance } = useReadSortitionModuleGetJurorBalance({
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
              <CourtCard key={id} name={name ?? ""} stake={staked} {...{ id }} />
            ))}
        </CourtCardsContainer>
      ) : null}
    </Container>
  );
};

export default Courts;
