"use client";
import React, { useContext, useMemo, useRef, createContext } from "react";
import styled, { css } from "styled-components";

import Link from "next/link";
import { useClickAway, useToggle } from "react-use";

import KlerosDevtoolsLogo from "svgs/header/devtools-logo.svg";
import HamburgerIcon from "svgs/header/hamburger.svg";

import { landscapeStyle } from "styles/landscapeStyle";

import LightButton from "components/LightButton";

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
  background-color: transparent;
  :hover {
    background-color: transparent;
  }

  .button-svg {
    margin-right: 0px;
    fill: white;
  }
  .button-text {
    display: none;
  }
`;

const OpenContext = createContext({
  isOpen: false,
  toggleIsOpen: () => {
    // Placeholder
  },
});

export function useOpenContext() {
  return useContext(OpenContext);
}

const MobileHeader: React.FC = () => {
  const [isOpen, toggleIsOpen] = useToggle(false);
  const containerRef = useRef(null);
  useClickAway(containerRef, () => toggleIsOpen(false));
  const memoizedContext = useMemo(() => ({ isOpen, toggleIsOpen }), [isOpen, toggleIsOpen]);
  return (
    <Container ref={containerRef}>
      <OpenContext.Provider value={memoizedContext}>
        <Link href="/">
          <KlerosDevtoolsLogo />
        </Link>
        <NavBar />
        <StyledLightButton text="" Icon={HamburgerIcon} onClick={toggleIsOpen} />
      </OpenContext.Provider>
    </Container>
  );
};

export default MobileHeader;
