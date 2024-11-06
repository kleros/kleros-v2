import React, { useMemo } from "react";
import styled from "styled-components";

import { isUndefined } from "utils/index";

import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";

import { responsiveSize } from "styles/responsiveSize";

import DisputeView from "components/DisputeView";
import { SkeletonDisputeCard } from "components/StyledSkeleton";

import { Dispute_Filter } from "../graphql/graphql";

const Container = styled.div`
  margin-top: ${responsiveSize(48, 80)};
`;

const Title = styled.h1`
  margin-bottom: ${responsiveSize(16, 48)};
`;

const DisputeContainer = styled.div`
  --gap: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(350px, (100% - var(--gap) * 2)/3)), 1fr));
  align-items: center;
  gap: var(--gap);
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
          : disputes.map((dispute) => <DisputeView key={dispute.id} {...dispute} overrideIsList />)}
      </DisputeContainer>
    </Container>
  ) : null;
};

export default LatestCases;
