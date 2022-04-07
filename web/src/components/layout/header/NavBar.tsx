import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Container = styled.nav`
  position: absolute;
  width: 100%;
  background-color: ${({ theme }) => theme.primaryPurple};
`;

const StyledLink = styled(Link)`
  color: white;
`;

const LinkContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const links = [
  { to: "/cases", text: "Cases" },
  { to: "/courts", text: "Courts" },
  { to: "/dashboard", text: "Dashboard" },
];

const NavBar: React.FC = () => (
  <Container>
    {links.map(({ to, text }) => (
      <LinkContainer key={text}>
        <StyledLink {...{ to }}>{text}</StyledLink>
      </LinkContainer>
    ))}
  </Container>
);

export default NavBar;
