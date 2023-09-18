import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import { useCasesQuery } from "queries/useCasesQuery";
import CasesDisplay from "components/CasesDisplay";
import CaseDetails from "./CaseDetails";

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: calc(32px + (136 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-top: calc(32px + (80 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-bottom: calc(64px + (96 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
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
                numberDisputes={data.counter?.cases}
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
