import React, { useState } from "react";
import styled, { css } from "styled-components";
import HamburgerIcon from "svgs/header/hamburger.svg";

import { useLockBodyScroll } from "react-use";

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
  padding: 0 !important;

  .button-svg {
    margin-right: 0px;
  }
`;

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  useLockBodyScroll(isOpen);

  const handleOpenNavbar = () => {
    setIsOpen(true);
  };

  const handleCloseNavbar = () => {
    setIsOpen(false);
  };

  return (
    <Container>
      <Logo />
      <StyledLightButton text="" Icon={HamburgerIcon} onClick={handleOpenNavbar} />
      <NavBar {...{ isOpen, handleCloseNavbar }} />
    </Container>
  );
};

export default MobileHeader;
