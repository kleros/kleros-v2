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
  height: 92%;
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

const PopupContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: ${({ theme }) => theme.blackLowOpacity};
`;

const StyledOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  z-index: 1;
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

  return (
    <>
      {isOpen ? <Overlay {...{ isOpen }} onClick={handleCloseNavbar} /> : null}
      <Wrapper {...{ isOpen }}>
        <StyledOverlay>
          <Container {...{ isOpen }}>
            <LightButton
              isMobileNavbar={true}
              text="Kleros Solutions"
              onClick={() => {
                toggleIsDappListOpen();
              }}
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
            <Menu {...{ toggleIsHelpOpen, toggleIsSettingsOpen }} isMobileNavbar={true} />
            <br />
          </Container>
        </StyledOverlay>
      </Wrapper>
      {(isDappListOpen || isHelpOpen || isSettingsOpen) && (
        <PopupContainer>
          {isDappListOpen && <DappList {...{ toggleIsDappListOpen }} />}
          {isHelpOpen && <Help {...{ toggleIsHelpOpen }} />}
          {isSettingsOpen && <Settings {...{ toggleIsSettingsOpen }} />}
        </PopupContainer>
      )}
    </>
  );
};

export default NavBar;
