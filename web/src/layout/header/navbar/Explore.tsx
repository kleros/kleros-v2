import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Container = styled.div``;

const LinkContainer = styled.div`
  min-height: 32px;
  display: flex;
  align-items: center;

  .sm-link {
    color: ${({ theme }) => theme.primaryText};
    text-decoration: none;
  }
`;

const links = [
  { to: "/cases", text: "Cases" },
  { to: "/courts", text: "Courts" },
  { to: "/dashboard", text: "Dashboard" },
];

const Explore: React.FC = () => (
  <Container>
    <h1>Explore</h1>
    {links.map(({ to, text }) => (
      <LinkContainer key={text}>
        <Link {...{ to }} className="sm-link">
          {text}
        </Link>
      </LinkContainer>
    ))}
  </Container>
);

export default Explore;
