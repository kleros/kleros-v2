import React from "react";
import styled from "styled-components";
import { useToggle } from "react-use";
import { useAccount } from "wagmi";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import { useOpenContext } from "../MobileHeader";
import DappList from "./DappList";
import Explore from "./Explore";
import ConnectWallet from "components/ConnectWallet";
import LightButton from "components/LightButton";
import { Overlay } from "components/Overlay";
import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";
import Menu from "./Menu";
import Help from "./Menu/Help";
import Settings from "./Menu/Settings";
import { DisconnectWalletButton } from "./Menu/Settings/General";
import { PopupContainer } from "..";

const Container = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  z-index: 1;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
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

export interface ISettings {
  toggleIsSettingsOpen: () => void;
}

export interface IHelp {
  toggleIsHelpOpen: () => void;
}

export interface IDappList {
  toggleIsDappListOpen: () => void;
}

const NavBar: React.FC = () => {
  const { isConnected } = useAccount();
  const [isDappListOpen, toggleIsDappListOpen] = useToggle(false);
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(false);
  const [isSettingsOpen, toggleIsSettingsOpen] = useToggle(false);
  const { isOpen } = useOpenContext();
  useLockOverlayScroll(isOpen);

  return (
    <>
      <Container {...{ isOpen }}>
        <LightButton
          text="Kleros Solutions"
          onClick={() => {
            toggleIsDappListOpen();
          }}
          Icon={KlerosSolutionsIcon}
        />
        <hr />
        <Explore />
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
        <Menu {...{ toggleIsHelpOpen, toggleIsSettingsOpen }} />
        <br />
      </Container>
      {(isDappListOpen || isHelpOpen || isSettingsOpen) && (
        <PopupContainer>
          <Overlay />
          {isDappListOpen && <DappList {...{ toggleIsDappListOpen }} />}
          {isHelpOpen && <Help {...{ toggleIsHelpOpen }} />}
          {isSettingsOpen && <Settings {...{ toggleIsSettingsOpen }} />}
        </PopupContainer>
      )}
    </>
  );
};

export default NavBar;
