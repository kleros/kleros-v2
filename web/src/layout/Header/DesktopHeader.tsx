import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useToggle } from "react-use";
import { Link } from "react-router-dom";
import { useLockOverlayScroll } from "hooks/useLockOverlayScroll";
import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";
import ConnectWallet from "components/ConnectWallet";
import LightButton from "components/LightButton";
import DappList from "./navbar/DappList";
import Explore from "./navbar/Explore";
import Menu from "./navbar/Menu";
import Help from "./navbar/Menu/Help";
import Settings from "./navbar/Menu/Settings";
import { Overlay } from "components/Overlay";
import { PopupContainer } from ".";

const Container = styled.div`
  display: none;
  position: absolute;

  ${landscapeStyle(
    () => css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      position: relative;
    `
  )};
`;

const LeftSide = styled.div`
  display: flex;
`;

const MiddleSide = styled.div`
  display: flex;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: ${({ theme }) => theme.white} !important;
`;

const RightSide = styled.div`
  display: flex;
  gap: calc(8px + (16 - 8) * ((100vw - 300px) / (1024 - 300)));
  margin-left: 8px;
  canvas {
    width: 20px;
  }
`;

const LightButtonContainer = styled.div`
  display: flex;
  align-items: center;
  width: 16px;
  margin-left: calc(4px + (8 - 4) * ((100vw - 375px) / (1250 - 375)));
  margin-right: calc(12px + (16 - 12) * ((100vw - 375px) / (1250 - 375)));
`;

const StyledLink = styled(Link)`
  min-height: 48px;
`;

const StyledKlerosSolutionsIcon = styled(KlerosSolutionsIcon)`
  fill: ${({ theme }) => theme.white} !important;
`;

const ConnectWalletContainer = styled.div`
  label {
    color: ${({ theme }) => theme.white};
  }
`;

const DesktopHeader = () => {
  const [isDappListOpen, toggleIsDappListOpen] = useToggle(false);
  const [isHelpOpen, toggleIsHelpOpen] = useToggle(false);
  const [isSettingsOpen, toggleIsSettingsOpen] = useToggle(false);
  useLockOverlayScroll(isDappListOpen || isHelpOpen || isSettingsOpen);

  return (
    <>
      <Container>
        <LeftSide>
          <LightButtonContainer>
            <LightButton
              text=""
              onClick={() => {
                toggleIsDappListOpen();
              }}
              Icon={StyledKlerosSolutionsIcon}
            />
          </LightButtonContainer>
          <StyledLink to={"/"}>
            <KlerosCourtLogo />
          </StyledLink>
        </LeftSide>

        <MiddleSide>
          <Explore />
        </MiddleSide>

        <RightSide>
          <ConnectWalletContainer>
            <ConnectWallet />
          </ConnectWalletContainer>
          <Menu {...{ toggleIsHelpOpen, toggleIsSettingsOpen }} />
        </RightSide>
      </Container>
      {(isDappListOpen || isHelpOpen || isSettingsOpen) && (
        <PopupContainer>
          <Overlay />
          {isDappListOpen && <DappList {...{ toggleIsDappListOpen, isDappListOpen }} />}
          {isHelpOpen && <Help {...{ toggleIsHelpOpen, isHelpOpen }} />}
          {isSettingsOpen && <Settings {...{ toggleIsSettingsOpen, isSettingsOpen }} />}
        </PopupContainer>
      )}
    </>
  );
};
export default DesktopHeader;
