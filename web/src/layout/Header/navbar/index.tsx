import React from "react";
import styled from "styled-components";
import KlerosSolutionsIcon from "svgs/menu-icons/kleros-solutions.svg";
import LightButton from "components/LightButton";
import Explore from "./Explore";
import ConnectButton from "components/ConnectButton";
import Menu from "./Menu";
import { useOpenContext } from "../index";

const Container = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
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
    margin 24px 0;
  }
`;

const NavBar: React.FC = () => {
  const { isOpen } = useOpenContext();
  return (
    <Container {...{ isOpen }}>
      <LightButton text="Kleros Solutions" Icon={KlerosSolutionsIcon} />
      <hr />
      <Explore />
      <hr />
      <ConnectButton />
      <hr />
      <Menu />
    </Container>
  );
};

export default NavBar;
