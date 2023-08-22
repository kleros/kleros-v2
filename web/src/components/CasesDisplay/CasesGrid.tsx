import React from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { StandardPagination } from "@kleros/ui-components-library";
import { isUndefined } from "utils/index";
import { DisputeDetailsFragment } from "queries/useCasesQuery";
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
  currentPage: number;
  setCurrentPage: (newPage: number) => void;
  numberDisputes?: number;
  casesPerPage: number;
}

const CasesGrid: React.FC<ICasesGrid> = ({ disputes, currentPage, setCurrentPage, numberDisputes, casesPerPage }) => {
  const hasNeverStaked = isUndefined(numberDisputes);
  return (
    <>
      {!hasNeverStaked && (
        <Container>
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <StyledSkeleton key={i} />)
            : disputes.map((dispute, i) => {
                return <DisputeCard key={i} {...dispute} />;
              })}
        </Container>
      )}
      <StyledPagination
        {...{ currentPage }}
        numPages={Math.ceil((numberDisputes ?? 0) / casesPerPage)}
        callback={(page: number) => setCurrentPage(page)}
      />
    </>
  );
};

export default CasesGrid;
