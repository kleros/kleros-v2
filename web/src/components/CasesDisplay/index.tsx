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
  title?: string;
  className?: string;
}

const CasesDisplay: React.FC<ICasesDisplay> = ({
  casesPerPage,
  title = "Cases",
  disputes,
  className,
}) => (
  <div {...{ className }}>
    <h1>{title}</h1>
    <Search />
    <StatsAndFilters />
    <StyledHR />
    <CasesGrid {...{ disputes, casesPerPage }} />
  </div>
);

export default CasesDisplay;
