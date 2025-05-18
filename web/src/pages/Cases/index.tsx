import React from "react";
import styled, { css } from "styled-components";

import { Routes, Route } from "react-router-dom";

import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import CaseDetails from "./CaseDetails";
import CasesFetcher from "./CasesFetcher";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px 16px 40px;
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;

  ${landscapeStyle(
    () => css`
      padding: 48px ${responsiveSize(0, 132)} 60px;
    `
  )}
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
