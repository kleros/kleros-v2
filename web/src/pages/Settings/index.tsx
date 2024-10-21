import React from "react";
import styled from "styled-components";

import { Route, Routes } from "react-router-dom";

import { responsiveSize } from "styles/responsiveSize";

import EmailConfirmation from "./EmailConfirmation";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: ${responsiveSize(32, 80)} ${responsiveSize(24, 136)} ${responsiveSize(76, 96)};
  max-width: 1780px;
  margin: 0 auto;
`;

const Settings: React.FC = () => {
  return (
    <Container>
      <Routes>
        <Route path="email-confirmation" element={<EmailConfirmation />} />
      </Routes>
    </Container>
  );
};

export default Settings;
