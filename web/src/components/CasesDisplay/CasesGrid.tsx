import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { SkeletonDisputeCard, SkeletonDisputeListItem } from "../StyledSkeleton";
import { StandardPagination } from "@kleros/ui-components-library";
import { useIsList } from "context/IsListProvider";
import { isUndefined } from "utils/index";
import { decodeURIFilter } from "utils/uri";
import { DisputeDetailsFragment } from "queries/useCasesQuery";
import useIsDesktop from "hooks/useIsDesktop";
import DisputeCard from "components/DisputeCard";
import CasesListHeader from "./CasesListHeader";

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
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
          <CasesListHeader />
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <SkeletonDisputeListItem key={i} />)
            : disputes.map((dispute) => {
                return <DisputeCard key={dispute.id} {...dispute} />;
              })}
        </ListContainer>
      ) : (
        <GridContainer>
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <SkeletonDisputeCard key={i} />)
            : disputes.map((dispute) => {
                return <DisputeCard key={dispute.id} {...dispute} overrideIsList />;
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
