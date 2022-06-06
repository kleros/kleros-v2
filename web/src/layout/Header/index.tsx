import React, { useState, useRef } from "react";
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
  padding-right: 0;

  .button-svg {
    fill: white;
  }
`;

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  return (
    <Container>
      <Link className="kleros-court-link" to={"/"}>
        <KlerosCourtLogo />
      </Link>
      <div ref={containerRef}>
        <NavBar {...{ isOpen }} />
        <StyledLightButton
          text=""
          Icon={HamburgerIcon}
          onClick={toggleIsOpen}
        />
      </div>
    </Container>
  );
};

export default Header;
