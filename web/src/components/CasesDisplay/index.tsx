import React, { Dispatch, SetStateAction } from "react";
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
  disputeId?: Dispatch<SetStateAction<string>>;
}

const CasesDisplay: React.FC<ICasesDisplay> = ({
  disputes,
  currentPage,
  setCurrentPage,
  numberDisputes,
  casesPerPage,
  title = "Cases",
  className,
  disputeId,
  disputeById,
}) => {
  const getDisputeId = (value: SetStateAction<string>) => {
    disputeId?.(value);
  };

  return (
    <div {...{ className }}>
      <h1>{title}</h1>
      <Search getDisputeId={getDisputeId} />
      <StatsAndFilters />
      <StyledHR />
      {disputes.length > 0 ? (
        <CasesGrid
          {...{
            disputeById,
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
