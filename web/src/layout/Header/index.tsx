import React from "react";
import styled from "styled-components";

import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

const Container = styled.div`
  position: sticky;
  z-index: 10;
  top: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.primaryPurple};

  display: flex;
  flex-wrap: wrap;
`;

const HeaderContainer = styled.div`
  width: 100%;
  padding: 8px 24px;
`;

const Header: React.FC = () => {
  return (
    <Container>
      <HeaderContainer>
        <DesktopHeader />
        <MobileHeader />
      </HeaderContainer>
    </Container>
  );
};

export default Header;
