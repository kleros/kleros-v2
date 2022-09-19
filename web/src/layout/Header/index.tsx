import React, { useState, useRef, useContext } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import HamburgerIcon from "svgs/header/hamburger.svg";
import KlerosCourtLogo from "svgs/header/kleros-court.svg";
import { useFocusOutside } from "hooks/useFocusOutside";
import LightButton from "components/LightButton";
import NavBar from "./navbar";

const Container = styled.div`
  position: sticky;
  z-index: 9999;
  top: 0;
  width: 100%;
  height: 64px;
  background-color: ${({ theme }) => theme.primaryPurple};

  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .kleros-court-link {
    min-height: 48px;
  }
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

const OpenContext = React.createContext({
  isOpen: false,
  toggleIsOpen: () => {
    // Placeholder
  },
});

export const useOpenContext = () => {
  return useContext(OpenContext);
};

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  return (
    <Container>
      <OpenContext.Provider value={{ isOpen, toggleIsOpen }}>
        <Link className="kleros-court-link" to={"/"}>
          <KlerosCourtLogo />
        </Link>
        <div ref={containerRef}>
          <NavBar />
          <StyledLightButton
            text=""
            Icon={HamburgerIcon}
            onClick={toggleIsOpen}
          />
        </div>
      </OpenContext.Provider>
    </Container>
  );
};

export default Header;
