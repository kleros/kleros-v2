import React, { useMemo } from "react";
import styled from "styled-components";

import { isUndefined } from "utils/index";

import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";

import { responsiveSize } from "styles/responsiveSize";

import DisputeView from "components/DisputeView";
import { SkeletonDisputeCard } from "components/StyledSkeleton";

import { Dispute_Filter } from "../graphql/graphql";
import SeeAllCasesButton from "./SeeAllCasesButton";

const Container = styled.div`
  margin-top: ${responsiveSize(32, 48)};
`;

const TitleAndButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  gap: 4px 12px;
  margin-bottom: ${responsiveSize(12, 24)};
`;

const Title = styled.h1`
  margin-bottom: 0;
  font-size: ${responsiveSize(20, 24)};
`;

const DisputeContainer = styled.div`
  --gap: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(312px, (100% - var(--gap) * 2)/3)), 1fr));
  align-items: stretch;
  gap: var(--gap);
`;

interface ILatestCases {
  title?: string;
  filters?: Dispute_Filter;
}

const LatestCases: React.FC<ILatestCases> = ({ title = "Latest Cases", filters }) => {
  const { data } = useCasesQuery(0, 3, filters);
  const disputes: DisputeDetailsFragment[] = useMemo(() => data?.disputes as DisputeDetailsFragment[], [data]);
  const courtId = typeof filters?.court === "string" ? filters?.court : undefined;

  return isUndefined(disputes) || disputes.length > 0 ? (
    <Container>
      <TitleAndButtonContainer>
        <Title>{title}</Title>
        <SeeAllCasesButton {...{ courtId }} />
      </TitleAndButtonContainer>
      <DisputeContainer>
        {isUndefined(disputes)
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonDisputeCard key={index} />)
          : disputes.map((dispute) => <DisputeView key={dispute.id} {...dispute} overrideIsList />)}
      </DisputeContainer>
    </Container>
  ) : null;
};

export default LatestCases;
