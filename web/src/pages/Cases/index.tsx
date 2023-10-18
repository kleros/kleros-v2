import React from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import CaseDetails from "./CaseDetails";
import CasesFetcher from "./CasesFetcher";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: calc(32px + (136 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-top: calc(32px + (80 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-bottom: calc(64px + (120 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  max-width: 1780px;
  margin: 0 auto;
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
