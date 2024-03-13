import React, { useContext, useMemo, useRef } from "react";
import styled, { css } from "styled-components";

import { Link } from "react-router-dom";
import { useClickAway, useToggle } from "react-use";

import HamburgerIcon from "svgs/header/hamburger.svg";
import KlerosCourtUniversityLogo from "svgs/header/kleros-court-university.svg";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";

import { landscapeStyle } from "styles/landscapeStyle";

import LightButton from "components/LightButton";

import NavBar from "./navbar";

const IS_UNIVERSITY = process.env.REACT_APP_UNIVERSITY_COURT === "true";

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

const StyledLink = styled(Link)`
  min-height: 48px;
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
        <StyledLink to={"/"}>{IS_UNIVERSITY ? <KlerosCourtUniversityLogo /> : <KlerosCourtLogo />}</StyledLink>
        <NavBar />
        <StyledLightButton text="" Icon={HamburgerIcon} onClick={toggleIsOpen} />
      </OpenContext.Provider>
    </Container>
  );
};
export default MobileHeader;
