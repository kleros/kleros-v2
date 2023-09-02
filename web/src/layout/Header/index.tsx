import React, { useState, useRef, useContext } from "react";
import styled, { css } from "styled-components";
import { useToggle } from "react-use";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { Link } from "react-router-dom";
import HamburgerIcon from "svgs/header/hamburger.svg";
import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";
import LightButton from "components/LightButton";
import ConnectWallet from "components/ConnectWallet";
import NavBar from "./navbar";
import DappList from "./navbar/DappList";
import Explore from "./navbar/Explore";
import Menu from "./navbar/Menu";
import { useFocusOutside } from "hooks/useFocusOutside";

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

const MobileNavBar = styled.div`
  display: none;
  ${smallScreenStyle(
    () => css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    `
  )}
`;

const DesktopNavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;

  ${smallScreenStyle(
    () => css`
      display: none;
    `
  )};
`;

const LeftSide = styled.div`
  display: flex;
`;

const MiddleSide = styled.div`
  display: flex;
  transform: translateX(50%);
  color: ${({ theme }) => theme.white} !important;
`;

const RightSide = styled.div`
  display: flex;
  gap: 16px;

  canvas {
    width: 20px;
  }
`;

const StyledLightButton = styled(LightButton)`
  ${smallScreenStyle(
    () => css`
      padding: 0;

      .button-svg {
        margin-right: 0px;
        fill: white;
      }
      .button-text {
        display: none;
      }
    `
  )}
`;

const LightButtonContainer = styled.div`
  display: flex;
  align-items: center;
  width: 16px;
  margin-left: calc(4px + (8 - 4) * ((100vw - 375px) / (1250 - 375)));
  margin-right: calc(12px + (16 - 12) * ((100vw - 375px) / (1250 - 375)));
`;

const StyledKlerosSolutionsIcon = styled(KlerosSolutionsIcon)`
  fill: ${({ theme }) => theme.white} !important;
`;

const ConnectWalletContainer = styled.div`
  label {
    color: ${({ theme }) => theme.white};
  }
`;

const OpenContext = React.createContext({
  isOpen: false,
  toggleIsOpen: () => {
    // Placeholder
  },
});

export function useOpenContext() {
  return useContext(OpenContext);
}

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSolutionsOpen, toggleSolution] = useToggle(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  return (
    <Container>
      <OpenContext.Provider value={{ isOpen, toggleIsOpen }}>
        <DesktopNavBar>
          <LeftSide>
            <LightButtonContainer>
              <LightButton
                text=""
                onClick={() => {
                  toggleSolution();
                }}
                Icon={StyledKlerosSolutionsIcon}
              />
            </LightButtonContainer>
            {isSolutionsOpen && <DappList toggleSolution={toggleSolution} />}
            <Link className="kleros-court-link" to={"/"}>
              <KlerosCourtLogo />
            </Link>
          </LeftSide>

          <MiddleSide>
            <Explore />
          </MiddleSide>

          <RightSide>
            <ConnectWalletContainer>
              <ConnectWallet />
            </ConnectWalletContainer>
            <Menu />
          </RightSide>
        </DesktopNavBar>

        <MobileNavBar ref={containerRef}>
          <Link className="kleros-court-link" to={"/"}>
            <KlerosCourtLogo />
          </Link>
          <NavBar />
          <StyledLightButton text="" Icon={HamburgerIcon} onClick={toggleIsOpen} />
        </MobileNavBar>
      </OpenContext.Provider>
    </Container>
  );
};

export default Header;
