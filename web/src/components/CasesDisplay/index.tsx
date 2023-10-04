import React from "react";
import styled from "styled-components";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import CasesGrid, { ICasesGrid } from "./CasesGrid";

const StyledHR = styled.hr`
  margin-top: 24px;
  margin-bottom: 24px;
`;

interface ICasesDisplay extends ICasesGrid {
  numberDisputes?: number;
  numberClosedDisputes?: number;
  title?: string;
  className?: string;
}

const CasesDisplay: React.FC<ICasesDisplay> = ({
  disputes,
  currentPage,
  setCurrentPage,
  numberDisputes,
  numberClosedDisputes,
  casesPerPage,
  title = "Cases",
  className,
  totalPages,
}) => {
  return (
    <div {...{ className }}>
      <h1>{title}</h1>
      <Search />
      <StatsAndFilters totalDisputes={numberDisputes ?? 0} closedDisputes={numberClosedDisputes ?? 0} />
      <StyledHR />

      {disputes?.length === 0 ? (
        <h1>No cases found</h1>
      ) : (
        <CasesGrid
          disputes={disputes}
          {...{
            casesPerPage,
            totalPages,
            currentPage,
            setCurrentPage,
          }}
        />
      )}
    </div>
  );
};

export default CasesDisplay;
