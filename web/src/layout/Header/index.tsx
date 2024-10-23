import React from "react";
import styled from "styled-components";

import { isProductionDeployment } from "consts/index";

import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import { TestnetBanner } from "./TestnetBanner";

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
  padding: 4px 24px 8px;
`;

const Header: React.FC = () => {
  return (
    <Container>
      {!isProductionDeployment() ? <TestnetBanner /> : null}
      <HeaderContainer>
        <DesktopHeader />
        <MobileHeader />
      </HeaderContainer>
    </Container>
  );
};

export default Header;
