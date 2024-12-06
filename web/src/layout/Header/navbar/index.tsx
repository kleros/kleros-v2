import React from "react";
import styled from "styled-components";

import { useToggle } from "react-use";
import { useAccount } from "wagmi";

import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";

import ConnectWallet from "components/ConnectWallet";
import LightButton from "components/LightButton";
import { Overlay } from "components/Overlay";
import DappList from "./DappList";
import Explore from "./Explore";
import Menu from "./Menu";
import Help from "./Menu/Help";
import Settings from "./Menu/Settings";
import { DisconnectWalletButton } from "./Menu/Settings/General";

const Wrapper = styled.div<{ isOpen: boolean }>`
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  position: absolute;
  top: 100%;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
`;

const Container = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 76%;
  overflow-y: auto;
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
  box-shadow: 0px 2px 3px ${({ theme }) => theme.defaultShadow};
  transform-origin: top;
  transform: scaleY(${({ isOpen }) => (isOpen ? "1" : "0")});
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition-property: transform, visibility;
  transition-duration: ${({ theme }) => theme.transitionSpeed};
  transition-timing-function: ease;
  padding: 24px;

  hr {
    margin: 24px 0;
  }
`;

const WalletContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const DisconnectWalletButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const PopupContainer = styled.div<{ isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: ${({ theme }) => theme.blackLowOpacity};
  opacity: ${({ isClosing }) => (isClosing ? 0 : 1)};
  transition: opacity 0.2s ease-in-out;
`;

const NavbarOverlay = styled.div<{ hasPopupOpen: boolean; isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  z-index: ${({ hasPopupOpen, isClosing }) => (hasPopupOpen || isClosing ? -1 : 1)};
`;

const StyledOverlay = styled(Overlay)`
  top: unset;
`;

export interface ISettings {
  toggleIsSettingsOpen: () => void;
  initialTab?: number;
}

export interface IHelp {
  toggleIsHelpOpen: () => void;
}

export interface IDappList {
  toggleIsDappListOpen: () => void;
}

interface INavBar {
  isOpen: boolean;
  handleCloseNavbar: () => void;
}

const NavBar: React.FC<INavBar> = ({ isOpen, handleCloseNavbar }) => {
  const { isConnected } = useAccount();
  const [isDappListOpen, toggleIsDappListOpen] = useToggle(false);
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(false);
  const [isSettingsOpen, toggleIsSettingsOpen] = useToggle(false);
  const [isClosing, toggleIsClosing] = useToggle(false);

  const hasPopupOpen = isDappListOpen || isHelpOpen || isSettingsOpen;

  const handleOpenPopup = (toggleFn: () => void) => {
    toggleIsClosing(false);
    toggleFn();
  };

  const handleClosePopup = () => {
    toggleIsClosing(true);
    setTimeout(() => {
      if (isDappListOpen) toggleIsDappListOpen(false);
      if (isHelpOpen) toggleIsHelpOpen(false);
      if (isSettingsOpen) toggleIsSettingsOpen(false);
      toggleIsClosing(false);
    }, 200);
  };

  return (
    <>
      {isOpen && <NavbarOverlay onClick={handleCloseNavbar} {...{ hasPopupOpen, isClosing }} />}
      <Wrapper {...{ isOpen }}>
        <StyledOverlay>
          <Container {...{ isOpen }}>
            <LightButton
              isMobileNavbar={true}
              text="Kleros Solutions"
              onClick={() => handleOpenPopup(toggleIsDappListOpen)}
              Icon={KlerosSolutionsIcon}
            />
            <hr />
            <Explore isMobileNavbar={true} {...{ handleCloseNavbar }} />
            <hr />
            <WalletContainer>
              <ConnectWallet />
              {isConnected && (
                <DisconnectWalletButtonContainer>
                  <DisconnectWalletButton />
                </DisconnectWalletButtonContainer>
              )}
            </WalletContainer>
            <hr />
            <Menu
              toggleIsHelpOpen={() => handleOpenPopup(toggleIsHelpOpen)}
              toggleIsSettingsOpen={() => handleOpenPopup(toggleIsSettingsOpen)}
              isMobileNavbar={true}
            />
            <br />
          </Container>
        </StyledOverlay>
      </Wrapper>
      {hasPopupOpen && (
        <PopupContainer {...{ isClosing }} onTransitionEnd={() => isClosing && handleClosePopup()}>
          {isDappListOpen && <DappList toggleIsDappListOpen={handleClosePopup} />}
          {isHelpOpen && <Help toggleIsHelpOpen={handleClosePopup} />}
          {isSettingsOpen && <Settings toggleIsSettingsOpen={handleClosePopup} />}
        </PopupContainer>
      )}
    </>
  );
};

export default NavBar;
