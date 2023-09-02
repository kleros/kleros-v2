import React from "react";
import styled, { css } from "styled-components";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { useLockBodyScroll, useToggle } from "react-use";
import ConnectWallet from "components/ConnectWallet";
import LightButton from "components/LightButton";
import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";
import { useOpenContext } from "../index";
import DappList from "./DappList";
import Explore from "./Explore";
import Menu from "./Menu";
import Debug from "./Debug";

const Container = styled.div<{ isOpen: boolean }>`
  ${({ isOpen }) =>
    smallScreenStyle(
      () => css`
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        z-index: 1;
        background-color: ${({ theme }) => theme.whiteBackground};
        border: 1px solid ${({ theme }) => theme.stroke};
        box-shadow: 0px 2px 3px ${({ theme }) => theme.defaultShadow};

        transform-origin: top;
        transform: scaleY(${isOpen ? "1" : "0"});
        visibility: ${isOpen ? "visible" : "hidden"};
        transition-property: transform, visibility;
        transition-duration: ${({ theme }) => theme.transitionSpeed};
        transition-timing-function: ease;

        padding: 24px;

        hr {
          margin: 24px 0;
        }
      `
    )}
`;

const NavBar: React.FC = () => {
  const [isSolutionsOpen, toggleSolution] = useToggle(false);
  const { isOpen } = useOpenContext();
  useLockBodyScroll(isOpen);

  return (
    <Container {...{ isOpen }}>
      <LightButton
        text="Kleros Solutions"
        onClick={() => {
          toggleSolution();
        }}
        Icon={KlerosSolutionsIcon}
      />
      {isSolutionsOpen && <DappList toggleSolution={toggleSolution} />}
      <hr />
      <Explore />
      <hr />
      <ConnectWallet />
      <hr />
      <Menu />
      <br />
      <Debug />
    </Container>
  );
};

export default NavBar;
