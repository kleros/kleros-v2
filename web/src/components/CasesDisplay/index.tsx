import React from "react";
import styled from "styled-components";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import CasesGrid, { ICasesGrid } from "./CasesGrid";
import { useFiltersContext } from "context/FilterProvider";

const StyledHR = styled.hr`
  margin-top: 24px;
  margin-bottom: 24px;
`;

interface ICasesDisplay extends ICasesGrid {
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
}) => {
  const { filteredCases, isFilterApplied } = useFiltersContext();

  return (
    <div {...{ className }}>
      <h1>{title}</h1>
      <Search />
      <StatsAndFilters totalDisputes={numberDisputes ?? 0} closedDisputes={numberClosedDisputes ?? 0} />
      <StyledHR />

      {isFilterApplied && filteredCases?.length === 0 ? (
        <h1>No cases found</h1>
      ) : (
        <CasesGrid
          disputes={filteredCases?.length > 0 ? filteredCases : disputes}
          {...{
            currentPage,
            setCurrentPage,
            numberDisputes,
            casesPerPage,
          }}
        />
      )}
    </div>
  );
};

export default CasesDisplay;
