import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import { useCasesQuery } from "queries/useCasesQuery";
import { useWindowSize } from "react-use";
import { BREAKPOINT_LANDSCAPE } from "styles/landscapeStyle";
import CasesDisplay from "components/CasesDisplay";
import CaseDetails from "./CaseDetails";
import { useFiltersContext } from "context/FilterProvider";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: calc(32px + (136 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-top: calc(32px + (80 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-bottom: calc(64px + (96 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  max-width: 1780px;
  margin: 0 auto;
`;

const Cases: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { width } = useWindowSize();
  const { isList, setIsList } = useFiltersContext();
  const screenIsBig = width > BREAKPOINT_LANDSCAPE;
  const casesPerPage = screenIsBig ? 9 : 3;
  const { data } = useCasesQuery(casesPerPage * (currentPage - 1), casesPerPage);

  useEffect(() => {
    if (!screenIsBig && isList) {
      setIsList(false);
    }
  }, [screenIsBig, isList, setIsList]);

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
