import React, { useContext, useMemo, useRef } from "react";
import styled, { css } from "styled-components";

import { useClickAway, useToggle } from "react-use";

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
  height: 64px;

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

const OpenContext = React.createContext({
  isOpen: false,
  toggleIsOpen: () => {
    // Placeholder
  },
});

export function useOpenContext() {
  return useContext(OpenContext);
}

const MobileHeader = () => {
  const [isOpen, toggleIsOpen] = useToggle(false);
  const containerRef = useRef(null);
  useClickAway(containerRef, () => toggleIsOpen(false));
  const memoizedContext = useMemo(() => ({ isOpen, toggleIsOpen }), [isOpen, toggleIsOpen]);
  return (
    <Container ref={containerRef}>
      <OpenContext.Provider value={memoizedContext}>
        <Logo />
        <NavBar />
        <StyledLightButton text="" Icon={HamburgerIcon} onClick={toggleIsOpen} />
      </OpenContext.Provider>
    </Container>
  );
};
export default MobileHeader;
