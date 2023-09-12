import React from "react";
import styled, { css } from "styled-components";
import { StandardPagination } from "@kleros/ui-components-library";
import { portraitStyle } from "styles/portraitStyle";
import { useFiltersContext } from "context/FilterProvider";
import { CasesPageQuery } from "queries/useCasesQuery";
import DisputeCard from "components/DisputeCard";
import CasesListHeader from "./CasesListHeader";

const GridContainer = styled.div`
  display: grid;
  row-gap: 16px;
  column-gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  justify-content: space-between;
  align-items: center;
  justify-items: center;
  ${portraitStyle(css`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
  `)}
`;
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

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

const CasesGrid: React.FC<ICasesGrid> = ({ disputes, currentPage, setCurrentPage, numberDisputes, casesPerPage }) => {
  const { isList } = useFiltersContext();
  return (
    <>
      {!isList ? (
        <GridContainer>
          {disputes.map((dispute, i) => {
            return <DisputeCard key={i} {...dispute} />;
          })}
        </GridContainer>
      ) : (
        <ListContainer>
          {isList && <CasesListHeader />}
          {disputes.map((dispute, i) => {
            return <DisputeCard key={i} {...dispute} />;
          })}
        </ListContainer>
      )}
      <StyledPagination
        {...{ currentPage }}
        numPages={Math.ceil(numberDisputes / casesPerPage)}
        callback={(page: number) => setCurrentPage(page)}
      />
    </>
  );
};

export default CasesGrid;
