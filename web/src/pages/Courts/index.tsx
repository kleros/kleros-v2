import React from "react";
import styled from "styled-components";

import { responsiveSize } from "styles/responsiveSize";
import { MAX_WIDTH_LANDSCAPE } from "styles/landscapeStyle";

import { Routes, Route, Navigate } from "react-router-dom";

import CourtDetails from "./CourtDetails";
import TopSearch from "./TopSearch";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 80)} ${responsiveSize(24, 136)} ${responsiveSize(76, 96)};
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;
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
