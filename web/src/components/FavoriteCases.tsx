import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { StandardPagination } from "@kleros/ui-components-library";

import useStarredCases from "hooks/useStarredCases";
import { isUndefined } from "utils/index";

import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";

import { hoverShortTransitionTiming } from "styles/commonStyles";
import { responsiveSize } from "styles/responsiveSize";

import DisputeView from "components/DisputeView";
import { SkeletonDisputeCard } from "components/StyledSkeleton";

const Container = styled.div`
  margin-top: ${responsiveSize(24, 48)};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${responsiveSize(20, 24)};
`;

const DisputeContainer = styled.div`
  --gap: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(312px, (100% - var(--gap) * 2)/3)), 1fr));
  align-items: stretch;
  gap: var(--gap);
`;

const TitleAndClearLabel = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  margin-bottom: ${responsiveSize(12, 24)};
`;

const StyledLabel = styled.label`
  ${hoverShortTransitionTiming}
  color: ${({ theme }) => theme.primaryBlue};
  cursor: pointer;
  margin-top: 6px;

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
  const { t } = useTranslation();
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
      <TitleAndClearLabel>
        <Title>{t("misc.favorite_cases")}</Title>
        <StyledLabel onClick={clearAll}>{t("buttons.clear_all")}</StyledLabel>
      </TitleAndClearLabel>
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
