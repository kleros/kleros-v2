import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import { useCasesQuery } from "queries/useCasesQuery";
import CasesDisplay from "components/CasesDisplay";
import CaseDetails from "./CaseDetails";
import { useCasesQueryById } from "hooks/queries/useCasesQueryAll";

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Cases: React.FC = () => {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 3;
  const { data } = useCasesQuery(casesPerPage * (currentPage - 1));
  const dataCaseById = useCasesQueryById(query);
  return (
    <Container>
      <Routes>
        <Route
          path=""
          element={
            data && (
              <CasesDisplay
                disputeById={dataCaseById.data?.dispute}
                disputeId={setQuery}
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
