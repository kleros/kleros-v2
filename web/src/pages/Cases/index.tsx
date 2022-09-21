import React from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import CasesDisplay from "components/CasesDisplay";
import CaseDetails from "./CaseDetails";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Cases: React.FC = () => {
  return (
    <Container>
      <Routes>
        <Route path="" element={<CasesDisplay casesPerPage={3} />} />
        <Route path="/:id/*" element={<CaseDetails />} />
      </Routes>
    </Container>
  );
};

export default Cases;
