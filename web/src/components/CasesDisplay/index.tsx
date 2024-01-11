import React from "react";
import styled from "styled-components";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import CasesGrid, { ICasesGrid } from "./CasesGrid";
import { responsiveSize } from "styles/responsiveSize";

const Divider = styled.hr`
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: ${responsiveSize(20, 24)};
`;

const StyledTitle = styled.h1`
  margin-bottom: ${responsiveSize(32, 48)};
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
      <StyledTitle>{title}</StyledTitle>
      <Search />
      <StatsAndFilters totalDisputes={numberDisputes ?? 0} closedDisputes={numberClosedDisputes ?? 0} />
      <Divider />

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
