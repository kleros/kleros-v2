import React from "react";
import styled from "styled-components";
import KlerosCourt from "./KlerosCourt";
import NavBar from "./navbar";

const Container = styled.div`
  height: 64px;
  width: 100vw;
  background-color: ${({ theme }) => theme.primaryPurple};
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Header: React.FC = () => (
  <Container>
    <KlerosCourt />
    <NavBar />
  </Container>
);

export default Header;
