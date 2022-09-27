import React from "react";
import styled from "styled-components";
import { StandardPagination } from "@kleros/ui-components-library";
import { CasesPageQuery } from "queries/useCasesQuery";
import DisputeCard from "components/DisputeCard";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
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
  disputes: CasesPageQuery["disputes"];
  currentPage: number;
  setCurrentPage: (newPage: number) => void;
  numberDisputes: number;
  casesPerPage: number;
}

const CasesGrid: React.FC<ICasesGrid> = ({
  disputes,
  currentPage,
  setCurrentPage,
  numberDisputes,
  casesPerPage,
}) => {
  return (
    <>
      <Container>
        {disputes.map((dispute, i) => {
          return <DisputeCard key={i} {...dispute} />;
        })}
      </Container>
      <StyledPagination
        {...{ currentPage }}
        numPages={Math.ceil(numberDisputes / casesPerPage)}
        callback={(page: number) => setCurrentPage(page)}
      />
    </>
  );
};

export default CasesGrid;
