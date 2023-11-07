import React from "react";
import styled from "styled-components";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import CasesGrid, { ICasesGrid } from "./CasesGrid";

const Divider = styled.hr`
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: calc(20px + (24 - 20) * (min(max(100vw, 375px), 1250px) - 375px) / 875) 0;
`;

const StyledTitle = styled.h1`
  margin-bottom: calc(16px + (48 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
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
