import React, { useMemo } from "react";
import styled from "styled-components";
import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";
import DisputeCard from "components/DisputeCard";
import { StyledSkeleton } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";

const Container = styled.div`
  margin-top: calc(64px + (80 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  .disputes-container {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }

  h1 {
    margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  }
`;

const LatestCases: React.FC = () => {
  const { data } = useCasesQuery(0);
  const disputes: DisputeDetailsFragment[] = useMemo(() => data?.disputes as DisputeDetailsFragment[], [data]);

  return (
    <Container>
      <h1>Latest Cases</h1>
      <div className="disputes-container">
        {!isUndefined(disputes)
          ? disputes.map((dispute) => <DisputeCard key={dispute.id} {...dispute} overrideIsList />)
          : Array.from({ length: 3 }).map((_, index) => <StyledSkeleton key={index} width={312} height={260} />)}
      </div>
    </Container>
  );
};

export default LatestCases;
