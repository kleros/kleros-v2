import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import { useFiltersContext } from "context/FilterProvider";
import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";
import { useCourtDetails, CourtDetailsQuery } from "queries/useCourtDetails";
import { useCounterQuery } from "queries/useCounter";
import { CounterQuery, OrderDirection } from "src/graphql/graphql";
import CasesDisplay from "components/CasesDisplay";
import CaseDetails from "./CaseDetails";

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

export const calculatePages = (
  status: number,
  data: CounterQuery | CourtDetailsQuery | undefined,
  casesPerPage: number,
  numberDisputes: number
) => {
  if (!data) {
    return 0;
  }

  let totalPages = 0;

  switch (status) {
    case 1:
      totalPages =
        "counter" in data
          ? data?.counter?.cases - data?.counter?.casesRuled
          : (data as CourtDetailsQuery).court?.numberDisputes - (data as CourtDetailsQuery).court?.numberClosedDisputes;
      break;
    case 2:
      totalPages =
        "counter" in data ? data?.counter?.casesRuled : (data as CourtDetailsQuery).court?.numberClosedDisputes;
      break;
    case 3:
      totalPages =
        "counter" in data ? data?.counter?.casesAppealing : (data as CourtDetailsQuery).court?.numberAppealingDisputes;
      break;
    default:
      totalPages = "counter" in data ? numberDisputes ?? 0 : (data as CourtDetailsQuery).court?.numberDisputes;
  }

  return totalPages / casesPerPage;
};

const Cases: React.FC = () => {
  const casesPerPage = 3;
  const { combinedQueryFilters, debouncedSearch, timeFilter, statusFilter } = useFiltersContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [courtFilter, setCourtFilter] = useState(0);
  const { data: counterData } = useCounterQuery();
  const { data: courtData } = useCourtDetails(courtFilter.toString());
  const direction = timeFilter === 0 ? OrderDirection.Desc : OrderDirection.Asc;
  const courtChoice = courtFilter === 0 ? {} : { court: courtFilter.toString() };
  const disputeSkip = debouncedSearch ? 0 : 3 * (currentPage - 1);
  const queryFilters = { ...combinedQueryFilters, ...courtChoice };
  const { data } = useCasesQuery(disputeSkip, queryFilters, direction);
  const totalPages =
    courtFilter !== 0
      ? calculatePages(statusFilter, courtData, casesPerPage, courtData?.court?.numberDisputes)
      : calculatePages(statusFilter, counterData, casesPerPage, counterData?.counter?.cases);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, courtFilter]);

  return (
    <Container>
      <Routes>
        <Route
          path=""
          element={
            <CasesDisplay
              disputes={data?.disputes as DisputeDetailsFragment[]}
              numberDisputes={counterData?.counter?.cases}
              numberClosedDisputes={counterData?.counter?.casesRuled}
              totalPages={totalPages}
              {...{ casesPerPage, currentPage, setCurrentPage, setCourtFilter }}
            />
          }
        />
        <Route path="/:id/*" element={<CaseDetails />} />
      </Routes>
    </Container>
  );
};

export default Cases;
