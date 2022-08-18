import React from "react";
import styled from "styled-components";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import CasesGrid, { ICasesGrid } from "./CasesGrid";

const StyledHR = styled.hr`
  margin-top: 24px;
  margin-bottom: 24px;
`;

const CasesDisplay: React.FC<ICasesGrid> = ({ casesPerPage }) => (
  <>
    <h1>Cases</h1>
    <Search />
    <StatsAndFilters />
    <StyledHR />
    <CasesGrid {...{ casesPerPage }} />
  </>
);

export default CasesDisplay;
