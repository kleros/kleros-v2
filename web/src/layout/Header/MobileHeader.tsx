import React, { useContext, useMemo, useRef } from "react";
import styled, { css } from "styled-components";
import { useToggle } from "react-use";
import { landscapeStyle } from "styles/landscapeStyle";
import { Link } from "react-router-dom";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";
import HamburgerIcon from "svgs/header/hamburger.svg";
import LightButton from "components/LightButton";
import NavBar from "./navbar";
import { useFocusOutside } from "hooks/useFocusOutside";

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
  useFocusOutside(containerRef, () => toggleIsOpen(false));
  const memoizedContext = useMemo(() => ({ isOpen, toggleIsOpen }), [isOpen, toggleIsOpen]);
  return (
    <Container ref={containerRef}>
      <OpenContext.Provider value={memoizedContext}>
        <StyledLink to={"/"}>
          <KlerosCourtLogo />
        </StyledLink>
        <NavBar />
        <StyledLightButton text="" Icon={HamburgerIcon} onClick={toggleIsOpen} />
      </OpenContext.Provider>
    </Container>
  );
};
export default MobileHeader;
