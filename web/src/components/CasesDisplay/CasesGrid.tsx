import React from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { StandardPagination } from "@kleros/ui-components-library";
import { isUndefined } from "utils/index";
import { DisputeDetailsFragment } from "queries/useCasesQuery";
import { useFiltersContext } from "context/FilterProvider";
import DisputeCard from "components/DisputeCard";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
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
  numberDisputes?: number;
  currentPage: number;
  setCurrentPage: (newPage: number) => void;
  casesPerPage: number;
  totalPages: number;
}

const CasesGrid: React.FC<ICasesGrid> = ({
  disputes,
  numberDisputes,
  casesPerPage,
  totalPages,
  currentPage,
  setCurrentPage,
}) => {
  const { debouncedSearch } = useFiltersContext();

  return (
    <>
      {!isUndefined(numberDisputes) && (
        <Container>
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <StyledSkeleton key={i} />)
            : disputes.map((dispute, i) => {
                return <DisputeCard key={i} {...dispute} />;
              })}
        </Container>
      )}

      {debouncedSearch === "" && (
        <StyledPagination
          currentPage={currentPage}
          numPages={Math.ceil(totalPages ?? 0)}
          callback={(page: number) => setCurrentPage(page)}
        />
      )}
    </>
  );
};

export default CasesGrid;
