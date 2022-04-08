import React from "react";
import styled from "styled-components";
import Explore from "./Explore";
import ConnectButton from "components/ConnectButton";
import Menu from "./Menu";

const Container = styled.div`
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.whiteBackground};
  border: 1px solid ${({ theme }) => theme.stroke};
  box-shadow: 0px 2px 3px ${({ theme }) => theme.defaultShadow};
  padding: 24px;

  hr {
    margin 24px 0;
  }
`;

const NavBar: React.FC = () => (
  <Container>
    <hr />
    <Explore />
    <hr />
    <ConnectButton />
    <hr />
    <Menu />
  </Container>
);

export default NavBar;
