import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import { useCasesQuery } from "queries/useCasesQuery";
import CasesDisplay from "components/CasesDisplay";
import CaseDetails from "./CaseDetails";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Cases: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 3;
  const { data } = useCasesQuery(casesPerPage * (currentPage - 1));
  return (
    <Container>
      <Routes>
        <Route
          path=""
          element={
            data && (
              <CasesDisplay
                disputes={data.disputes}
                numberDisputes={data.casesDataPoint?.value}
                {...{ currentPage, setCurrentPage, casesPerPage }}
              />
            )
          }
        />
        <Route path="/:id/*" element={<CaseDetails />} />
      </Routes>
    </Container>
  );
};

export default Cases;
