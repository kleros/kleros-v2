import React from "react";
import styled from "styled-components";
import MobileHeader from "./MobileHeader";
import DesktopHeader from "./DesktopHeader";
import { TestnetBanner } from "./TestnetBanner";
import { isProductionDeployment } from "consts/index";

const Container = styled.div`
  position: sticky;
  z-index: 1;
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

export const PopupContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 30;
`;

const Header: React.FC = () => {
  return (
    <Container>
      {isProductionDeployment() ? <TestnetBanner /> : null}
      <HeaderContainer>
        <DesktopHeader />
        <MobileHeader />
      </HeaderContainer>
    </Container>
  );
};

export default Header;
