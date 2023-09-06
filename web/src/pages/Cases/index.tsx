import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import { useCasesQuery } from "queries/useCasesQuery";
import { useWindowWidth } from "hooks/useWindowWidth";
import { BREAKPOINT_TABLET_SCREEN } from "styles/tabletScreenStyle";
import CasesDisplay from "components/CasesDisplay";
import CaseDetails from "./CaseDetails";
import { useFiltersContext } from "context/FilterProvider";
const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Cases: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const windowWidth = useWindowWidth();
  const { isList, setIsList } = useFiltersContext();
  const screenIsBig = windowWidth > BREAKPOINT_TABLET_SCREEN;
  const casesPerPage = screenIsBig ? 9 : 3;
  const { data } = useCasesQuery(casesPerPage * (currentPage - 1), casesPerPage);

  useEffect(() => {
    if (!screenIsBig && isList) {
      setIsList(false);
    }
  }, [screenIsBig]);

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
