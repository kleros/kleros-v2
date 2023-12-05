import React from "react";
import styled, { css } from "styled-components";
import { SkeletonDisputeListItem } from "components/StyledSkeleton";
import Header from "./Header";
import JurorCard from "./JurorCard";
import { isUndefined } from "utils/index";
import { useTopUsersByCoherenceScore } from "queries/useTopUsersByCoherenceScore";
import { landscapeStyle } from "styles/landscapeStyle";

const Container = styled.div`
  margin-top: calc(64px + (80 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Title = styled.h1`
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const ListContainer = styled.div`
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

const TopJurors: React.FC = () => {
  const { data: queryJurors } = useTopUsersByCoherenceScore();

  const topJurors = queryJurors?.users?.map((juror, index) => ({
    ...juror,
    rank: index + 1,
  }));

  return (
    <Container>
      <Title>Top Jurors</Title>
      <ListContainer>
        <Header />
        {!isUndefined(topJurors)
          ? topJurors.map((juror) => <JurorCard key={juror.rank} address={juror.id} {...juror} />)
          : [...Array(5)].map((_, i) => <SkeletonDisputeListItem key={i} />)}
      </ListContainer>
    </Container>
  );
};
export default TopJurors;
