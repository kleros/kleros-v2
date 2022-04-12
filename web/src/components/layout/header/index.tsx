import React, { useState, useRef } from "react";
import styled from "styled-components";
import HamburgerIcon from "svgs/header/hamburger.svg";
import { useFocusOutside } from "hooks/useFocusOutside";
import LightButton from "components/LightButton";
import KlerosCourt from "./KlerosCourt";
import NavBar from "./navbar";

const Container = styled.div`
  position: sticky;
  top: 0;
  width: 100vw;
  height: 64px;
  background-color: ${({ theme }) => theme.primaryPurple};

  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledLightButton = styled(LightButton)`
  padding-right: 0;
`;

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleIsOpen = () => setIsOpen(!isOpen);
  const containerRef = useRef(null);
  useFocusOutside(containerRef, () => setIsOpen(false));
  return (
    <Container>
      <KlerosCourt />
      <div ref={containerRef}>
        <NavBar {...{ isOpen }} />
        <StyledLightButton
          text=""
          icon={(className: string) => <HamburgerIcon {...{ className }} />}
          onClick={toggleIsOpen}
        />
      </div>
    </Container>
  );
};

export default Header;
