import React from "react";
import styled from "styled-components";
import { Routes, Route, Navigate } from "react-router-dom";
import TopSearch from "./TopSearch";
import CourtDetails from "./CourtDetails";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: calc(32px + (136 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-top: calc(32px + (80 - 32) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  padding-bottom: calc(64px + (96 - 64) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
`;

const Courts: React.FC = () => {
  return (
    <Container>
      <TopSearch />
      <Routes>
        <Route path="/:id/*" element={<CourtDetails />} />
        <Route path="*" element={<Navigate to="1" replace />} />
      </Routes>
    </Container>
  );
};

export default Courts;
