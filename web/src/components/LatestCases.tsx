import React, { useMemo } from "react";
import styled from "styled-components";
import { Dispute_Filter } from "../graphql/graphql";
import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";
import DisputeCard from "components/DisputeCard";
import { SkeletonDisputeCard } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";

const Container = styled.div`
  margin-top: calc(64px + (80 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Title = styled.h1`
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const DisputeContainer = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
`;

const LatestCases: React.FC<{ filters?: Dispute_Filter }> = ({ filters }) => {
  const { data } = useCasesQuery(0, 3, filters);
  const disputes: DisputeDetailsFragment[] = useMemo(() => data?.disputes as DisputeDetailsFragment[], [data]);

  return isUndefined(disputes) || disputes.length > 0 ? (
    <Container>
      <Title>Latest Cases</Title>
      <DisputeContainer>
        {isUndefined(disputes)
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonDisputeCard key={index} />)
          : disputes.map((dispute) => <DisputeCard key={dispute.id} {...dispute} overrideIsList />)}
      </DisputeContainer>
    </Container>
  ) : null;
};

export default LatestCases;
