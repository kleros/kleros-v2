import React from "react";
import styled, { css } from "styled-components";
import { useToggle } from "react-use";
import { Link } from "react-router-dom";
import { smallScreenStyle } from "styles/smallScreenStyle";
import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";
import ConnectWallet from "components/ConnectWallet";
import LightButton from "components/LightButton";
import DappList from "./navbar/DappList";
import Explore from "./navbar/Explore";
import Menu from "./navbar/Menu";

const Container = styled.div`
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
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  color: ${({ theme }) => theme.white} !important;
`;

const RightSide = styled.div`
  display: flex;
  gap: 16px;

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

const StyledKlerosSolutionsIcon = styled(KlerosSolutionsIcon)`
  fill: ${({ theme }) => theme.white} !important;
`;

const ConnectWalletContainer = styled.div`
  label {
    color: ${({ theme }) => theme.white};
  }
`;

const DesktopHeader = () => {
  const [isSolutionsOpen, toggleSolution] = useToggle(false);
  return (
    <Container>
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
    </Container>
  );
};
export default DesktopHeader;
