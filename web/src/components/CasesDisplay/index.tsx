import React, { useState } from "react";
import styled from "styled-components";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import CasesGrid, { ICasesGrid } from "./CasesGrid";
import { useCasesQueryById } from "hooks/queries/useCasesQuerybyId";
// import { CasesPageQueryId } from "queries/useCasesQuerybyId";
const StyledHR = styled.hr`
  margin-top: 24px;
  margin-bottom: 24px;
`;

interface ICasesDisplay extends ICasesGrid {
  title?: string;
  className?: string;
}

const CasesDisplay: React.FC<ICasesDisplay> = ({
  disputes,
  currentPage,
  setCurrentPage,
  numberDisputes,
  casesPerPage,
  title = "Cases",
  className,
}) => {
  const [query, setQuery] = useState<string>("");
  const { data } = useCasesQueryById(query);
  const CaseIdData = data?.dispute;
  return (
    <div {...{ className }}>
      <h1>{title}</h1>
      <Search getDisputeId={setQuery} />
      <StatsAndFilters />
      <StyledHR />
      {disputes.length > 0 ? (
        <CasesGrid
          {...{
            CaseIdData,
            disputes,
            currentPage,
            setCurrentPage,
            numberDisputes,
            casesPerPage,
          }}
        />
      ) : (
        <h1>wow no cases</h1>
      )}
    </div>
  );
};

export default CasesDisplay;
