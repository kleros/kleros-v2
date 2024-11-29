import React, { useState } from "react";
import styled, { css } from "styled-components";
import HamburgerIcon from "svgs/header/hamburger.svg";

import { landscapeStyle } from "styles/landscapeStyle";

import LightButton from "components/LightButton";

import Logo from "./Logo";
import NavBar from "./navbar";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )}
`;

const StyledLightButton = styled(LightButton)`
  padding: 0;

  .button-svg {
    margin-right: 0px;
    fill: white;
  }
  .button-text {
    display: none;
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: absolute;
  top: 0;
  width: 100vw;
  height: 64px;
  z-index: 1;
`;

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenNavbar = () => {
    setIsOpen(true);
  };

  const handleCloseNavbar = () => {
    setIsOpen(false);
  };

  return (
    <Container>
      {isOpen ? <Overlay {...{ isOpen }} onClick={handleCloseNavbar} /> : null}

      <Logo />
      <StyledLightButton text="" Icon={HamburgerIcon} onClick={handleOpenNavbar} />
      <NavBar {...{ isOpen, handleCloseNavbar }} />
    </Container>
  );
};

export default MobileHeader;
