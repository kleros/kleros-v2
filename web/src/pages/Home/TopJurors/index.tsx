import React from "react";
import styled, { css } from "styled-components";
import { SkeletonDisputeListItem } from "components/StyledSkeleton";
import Header from "./Header";
import JurorCard from "./JurorCard";
import { isUndefined } from "utils/index";
import { useTopUsersByCoherenceScore } from "queries/useTopUsersByCoherenceScore";
import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  margin-top: ${responsiveSize(64, 80)};
`;

const Title = styled.h1`
  margin-bottom: ${responsiveSize(16, 48)};
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

const StyledLabel = styled.label`
  font-size: 16px;
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
      {!isUndefined(topJurors) && topJurors.length === 0 ? (
        <StyledLabel>There are no jurors staked yet.</StyledLabel>
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
