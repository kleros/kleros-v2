import React, { useContext, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { Link } from "react-router-dom";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";
import HamburgerIcon from "svgs/header/hamburger.svg";
import LightButton from "components/LightButton";
import NavBar from "./navbar";
import { useFocusOutside } from "hooks/useFocusOutside";

const Container = styled.div`
  display: none;
  ${smallScreenStyle(
    () => css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    `
  )}
`;

const StyledLightButton = styled(LightButton)`
  ${smallScreenStyle(
    () => css`
      padding: 0;

      .button-svg {
        margin-right: 0px;
        fill: white;
      }
      .button-text {
        display: none;
      }
    `
  )}
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  return (
    <Container ref={containerRef}>
      <OpenContext.Provider value={{ isOpen, toggleIsOpen }}>
        <Link className="kleros-court-link" to={"/"}>
          <KlerosCourtLogo />
        </Link>
        <NavBar />
        <StyledLightButton text="" Icon={HamburgerIcon} onClick={toggleIsOpen} />
      </OpenContext.Provider>
    </Container>
  );
};
export default MobileHeader;
