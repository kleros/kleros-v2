import React from "react";
import styled, { css } from "styled-components";

import { isUndefined } from "utils/index";

import { useJurorsByCoherenceScore } from "queries/useJurorsByCoherenceScore";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { SkeletonDisputeListItem } from "components/StyledSkeleton";

import Header from "./Header";
import JurorCard from "./JurorCard";
import SeeAllJurorsButton from "components/SeeAllJurorsButton";

const Container = styled.div`
  margin-top: ${responsiveSize(28, 48)};
`;

const TitleAndButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: ${responsiveSize(12, 24)};
`;

const Title = styled.h1`
  margin-bottom: 0;
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

const TopJurors: React.FC = () => {
  const { data: queryJurors } = useJurorsByCoherenceScore(0, 5, "coherenceScore", "desc");

  const topJurors = queryJurors?.users?.map((juror, index) => ({
    ...juror,
    rank: index + 1,
  }));

  return (
    <Container>
      <TitleAndButtonContainer>
        <Title>Top Jurors</Title>
        <SeeAllJurorsButton />
      </TitleAndButtonContainer>
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
    </Container>
  );
};
export default TopJurors;
