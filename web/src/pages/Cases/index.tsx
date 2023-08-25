import React, { useEffect } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import { useAccount } from "wagmi";
import { useFiltersContext } from "context/FilterProvider";
import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";
import { useCounterQuery } from "queries/useCounter";
import CasesDisplay from "components/CasesDisplay";
import CaseDetails from "./CaseDetails";

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Cases: React.FC = () => {
  const { isConnected } = useAccount();
  const casesPerPage = 3;
  const { setCurrentPage, currentPage } = useFiltersContext();
  const { data } = useCasesQuery(casesPerPage * (currentPage - 1));
  const { data: counterData } = useCounterQuery();

  const { setIsDashboard } = useFiltersContext();

  useEffect(() => {
    setIsDashboard(false);
  }, [isConnected]);

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
              {...{ currentPage, setCurrentPage, casesPerPage }}
            />
          }
        />
        <Route path="/:id/*" element={<CaseDetails />} />
      </Routes>
    </Container>
  );
};

export default Cases;
