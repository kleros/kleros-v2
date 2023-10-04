import React from "react";
import styled, { css } from "styled-components";
import { useLocalStorage } from "react-use";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { StandardPagination } from "@kleros/ui-components-library";
import { landscapeStyle } from "styles/landscapeStyle";
import { isUndefined } from "utils/index";
import { decodeURIFilter } from "utils/uri";
import { DisputeDetailsFragment } from "queries/useCasesQuery";
import DisputeCard from "components/DisputeCard";
import CasesListHeader from "./CasesListHeader";

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  ${landscapeStyle(
    () =>
      css`
        display: grid;
        row-gap: 16px;
        column-gap: 8px;
        grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
        justify-content: space-between;
      `
  )}
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

const StyledSkeleton = styled(Skeleton)`
  height: 260px;
  width: 310px;
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
  const [isList, _] = useLocalStorage("isList", false);

  return (
    <>
      {!isList ? (
        <GridContainer>
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <StyledSkeleton key={i} />)
            : disputes.map((dispute, i) => {
                return <DisputeCard key={i} {...dispute} />;
              })}
        </GridContainer>
      ) : (
        <ListContainer>
          <CasesListHeader />
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <StyledSkeleton key={i} />)
            : disputes.map((dispute, i) => {
                return <DisputeCard key={i} {...dispute} />;
              })}
        </ListContainer>
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
