import React from "react";
import styled from "styled-components";
import MobileHeader from "./MobileHeader";
import DesktopHeader from "./DesktopHeader";

const Container = styled.div`
  position: sticky;
  z-index: 1;
  top: 0;
  width: 100%;
  height: 64px;
  background-color: ${({ theme }) => theme.primaryPurple};

  padding: 0 24px;
  display: flex;

  .kleros-court-link {
    min-height: 48px;
  }
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
