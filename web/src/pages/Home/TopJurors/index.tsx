import React from "react";
import styled, { css } from "styled-components";

import { isUndefined } from "utils/index";

import { useJurorsByCoherenceScore } from "queries/useJurorsByCoherenceScore";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { SkeletonDisputeListItem } from "components/StyledSkeleton";

import Header from "./Header";
import JurorCard from "./JurorCard";
import JurorsLeaderboardButton from "components/JurorsLeaderboardButton";

const Container = styled.div`
  margin-top: ${responsiveSize(24, 48)};
`;

const Title = styled.h1`
  margin-bottom: ${responsiveSize(12, 24)};
  font-size: ${responsiveSize(20, 24)};
`;

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  ${landscapeStyle(
    () => css`
      display: grid;
      grid-template-columns: 1fr;
    `
  )}
`;

export const StyledLabel = styled.label`
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 16px;
  justify-content: center;
`;

const TopJurors: React.FC = () => {
  const { data: queryJurors } = useJurorsByCoherenceScore(0, 5, "coherenceScore", "desc");

  const topJurors = queryJurors?.users?.map((juror, index) => ({
    ...juror,
    rank: index + 1,
  }));

  return (
    <Container>
      <Title>Top Jurors</Title>
      {!isUndefined(topJurors) && topJurors.length === 0 ? (
        <StyledLabel>No jurors found</StyledLabel>
      ) : (
        <ListContainer>
          <Header />
          {!isUndefined(topJurors)
            ? topJurors.map((juror) => <JurorCard key={juror.rank} address={juror.id} {...juror} />)
            : [...Array(5)].map((_, i) => <SkeletonDisputeListItem key={i} />)}
        </ListContainer>
      )}
      <ButtonContainer>
        <JurorsLeaderboardButton />
      </ButtonContainer>
    </Container>
  );
};
export default TopJurors;
