import React from "react";
import styled from "styled-components";

import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: sticky;
  padding: 0 24px;
  z-index: 10;
  top: 0;
  width: 100%;
  background-color: ${({ theme }) => (theme.name === "dark" ? `${theme.lightBlue}A6` : theme.primaryPurple)};
  backdrop-filter: ${({ theme }) => (theme.name === "dark" ? "blur(12px)" : "none")};
  -webkit-backdrop-filter: ${({ theme }) => (theme.name === "dark" ? "blur(12px)" : "none")}; // Safari support
`;

const Header: React.FC = () => {
  return (
    <Container>
      <DesktopHeader />
      <MobileHeader />
    </Container>
  );
};

export default Header;
