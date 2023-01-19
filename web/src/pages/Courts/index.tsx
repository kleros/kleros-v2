import React from "react";
import styled from "styled-components";
import { Routes, Route, Navigate } from "react-router-dom";
import { useCourtTree } from "queries/useCourtTree";
import CourtDetails from "./CourtDetails";

const Container = styled.div`
  width: 100%;
  height: auto;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px;
`;

const Courts: React.FC = () => {
  const tree = useCourtTree();
  return (
    <Container>
      <Routes>
        <Route path="/:id/*" element={<CourtDetails />} />
        <Route path="*" element={<Navigate to="1" />} />
      </Routes>
    </Container>
  );
};

export default Courts;
