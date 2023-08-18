import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
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
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 3;
  const { data } = useCasesQuery(casesPerPage * (currentPage - 1));
  const { data: counterData } = useCounterQuery();
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
