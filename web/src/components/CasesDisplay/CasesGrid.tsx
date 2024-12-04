import React from "react";
import styled from "styled-components";

import { useParams } from "react-router-dom";

import { StandardPagination } from "@kleros/ui-components-library";

import { useIsList } from "context/IsListProvider";
import useIsDesktop from "hooks/useIsDesktop";
import { isUndefined } from "utils/index";
import { decodeURIFilter } from "utils/uri";

import { DisputeDetailsFragment } from "queries/useCasesQuery";

import DisputeView from "components/DisputeView";

import { SkeletonDisputeCard, SkeletonDisputeListItem } from "../StyledSkeleton";

const GridContainer = styled.div`
  --gap: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(312px, (100% - var(--gap) * 2)/3)), 1fr));
  align-items: stretch;
  gap: var(--gap);
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

// 24px as margin-top since we already have 8px from the flex gap
const StyledPagination = styled(StandardPagination)`
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

export interface ICasesGrid {
  disputes?: DisputeDetailsFragment[];
  currentPage: number;
  setCurrentPage: (newPage: number) => void;
  casesPerPage: number;
  totalPages: number;
}

const CasesGrid: React.FC<ICasesGrid> = ({ disputes, casesPerPage, totalPages, currentPage, setCurrentPage }) => {
  const { filter } = useParams();
  const decodedFilter = decodeURIFilter(filter ?? "all");
  const { id: searchValue } = decodedFilter;
  const { isList } = useIsList();
  const isDesktop = useIsDesktop();

  return (
    <>
      {isList && isDesktop ? (
        <ListContainer>
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <SkeletonDisputeListItem key={i} />)
            : disputes.map((dispute) => {
                return <DisputeView key={dispute.id} {...dispute} />;
              })}
        </ListContainer>
      ) : (
        <GridContainer>
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <SkeletonDisputeCard key={i} />)
            : disputes.map((dispute) => {
                return <DisputeView key={dispute.id} {...dispute} overrideIsList />;
              })}
        </GridContainer>
      )}

      {isUndefined(searchValue) ? (
        <StyledPagination
          currentPage={currentPage}
          numPages={Math.ceil(totalPages ?? 0)}
          callback={(page: number) => setCurrentPage(page)}
        />
      ) : null}
    </>
  );
};

export default CasesGrid;
