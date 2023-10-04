import React from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import CaseDetails from "./CaseDetails";
import CasesFetcher from "./CasesFetcher";

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 144px);
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Cases: React.FC = () => (
  <Container>
    <Routes>
      <Route path="/display/:page/:order/:filter" element={<CasesFetcher />} />
      <Route path="/:id/*" element={<CaseDetails />} />
    </Routes>
  </Container>
);

export default Cases;
