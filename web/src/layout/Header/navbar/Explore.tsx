import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Link, useLocation } from "react-router-dom";
import { useOpenContext } from "../MobileHeader";

const Container = styled.div`
  display: flex;
  gap: 0px;
  flex-direction: column;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: calc(4px + (16 - 4) * ((100vw - 375px) / (1250 - 375)));
    `
  )};
`;

const LinkContainer = styled.div`
  display: flex;
  min-height: 32px;
  align-items: center;
`;

const Title = styled.h1`
  display: block;

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.primaryText};
  text-decoration: none;
  font-size: 16px;

  &.active {
    font-weight: 600;
  }
  ${landscapeStyle(
    () => css`
      color: ${({ theme }) => theme.white};
    `
  )};
`;

const links = [
  { to: "/cases", text: "Cases" },
  { to: "/courts", text: "Courts" },
  { to: "/dashboard", text: "Dashboard" },
];

const Explore: React.FC = () => {
  const location = useLocation();
  const { toggleIsOpen } = useOpenContext();

  return (
    <Container>
      <Title>Explore</Title>
      {links.map(({ to, text }) => (
        <LinkContainer key={text}>
          <StyledLink
            {...{ to }}
            onClick={toggleIsOpen}
            className={`sm-link ${location.pathname.startsWith(to) ? "active" : ""}`}
          >
            {text}
          </StyledLink>
        </LinkContainer>
      ))}
    </Container>
  );
};

export default Explore;
