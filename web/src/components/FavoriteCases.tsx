import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { StandardPagination } from "@kleros/ui-components-library";

import useStarredCases from "hooks/useStarredCases";
import { isUndefined } from "utils/index";

import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";

import { responsiveSize } from "styles/responsiveSize";

import DisputeView from "components/DisputeView";
import { SkeletonDisputeCard } from "components/StyledSkeleton";

const Container = styled.div`
  margin-top: ${responsiveSize(24, 48)};
`;

const Title = styled.h1`
  margin-bottom: 4px;
`;

const DisputeContainer = styled.div`
  --gap: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(312px, (100% - var(--gap) * 2)/3)), 1fr));
  align-items: stretch;
  gap: var(--gap);
`;

const StyledLabel = styled.label`
  display: block;
  color: ${({ theme }) => theme.primaryBlue};
  cursor: pointer;
  margin-bottom: ${responsiveSize(12, 16)};
  :hover {
    color: ${({ theme }) => theme.secondaryBlue};
  }
`;

const StyledPagination = styled(StandardPagination)`
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

const FavoriteCases: React.FC = () => {
  const { starredCaseIds, clearAll } = useStarredCases();

  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 3;
  const totalPages = Math.ceil(starredCaseIds.length / casesPerPage);

  const { data } = useCasesQuery((currentPage - 1) * casesPerPage, casesPerPage, {
    id_in: starredCaseIds,
  });

  const disputes: DisputeDetailsFragment[] = useMemo(() => data?.disputes as DisputeDetailsFragment[], [data]);

  return starredCaseIds.length > 0 && (isUndefined(disputes) || disputes.length > 0) ? (
    <Container>
      <Title>Favorite Cases</Title>
      <StyledLabel onClick={clearAll}>Clear all</StyledLabel>
      <DisputeContainer>
        {isUndefined(disputes)
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonDisputeCard key={index} />)
          : disputes.map((dispute) => <DisputeView key={dispute.id} {...dispute} overrideIsList />)}
      </DisputeContainer>
      {totalPages > 1 ? (
        <StyledPagination
          currentPage={currentPage}
          numPages={totalPages}
          callback={(page: number) => setCurrentPage(page)}
        />
      ) : null}
    </Container>
  ) : null;
};

export default FavoriteCases;
