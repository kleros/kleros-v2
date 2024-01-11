import React, { useMemo } from "react";
import styled from "styled-components";
import { Dispute_Filter } from "../graphql/graphql";
import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";
import DisputeCard from "components/DisputeCard";
import { SkeletonDisputeCard } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div`
  margin-top: ${responsiveSize(48, 80)};
`;

const Title = styled.h1`
  margin-bottom: ${responsiveSize(16, 48)};
`;

const DisputeContainer = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
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
