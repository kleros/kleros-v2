import React from "react";
import styled, { css } from "styled-components";

import { Link, useLocation } from "react-router-dom";

import { landscapeStyle } from "styles/landscapeStyle";

import { useOpenContext } from "../MobileHeader";

const Container = styled.div`
  display: flex;
  gap: 0;
  flex-direction: column;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
    `
  )};
`;

const Title = styled.h1`
  display: block;
  margin-bottom: 8px;

  ${landscapeStyle(
    () => css`
      display: none;
    `
  )};
`;

const StyledLink = styled(Link)<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 16px;
  color: ${({ isActive, theme }) => (isActive ? theme.primaryText : `${theme.primaryText}BA`)};
  padding: 8px 8px 8px 0;
  border-radius: 7px;

  &:hover {
    color: ${({ theme }) => theme.white} !important;
  }

  ${landscapeStyle(
    () => css`
      color: ${({ isActive, theme }) => (isActive ? theme.white : `${theme.white}BA`)};
      padding: 16px 8px;
    `
  )};
`;

const links = [
  { to: "/", text: "Home" },
  { to: "/cases/display/1/desc/all", text: "Cases" },
  { to: "/courts", text: "Courts" },
  { to: "/dashboard/1/desc/all", text: "Dashboard" },
  { to: "/get-pnk", text: "Get PNK" },
];

const Explore: React.FC = () => {
  const location = useLocation();
  const { toggleIsOpen } = useOpenContext();

  return (
    <Container>
      <Title>Explore</Title>
      {links.map(({ to, text }) => (
        <StyledLink
          key={text}
          to={to}
          onClick={toggleIsOpen}
          isActive={to === "/" ? location.pathname === "/" : location.pathname.split("/")[1] === to.split("/")[1]}
        >
          {text}
        </StyledLink>
      ))}
    </Container>
  );
};

export default Explore;
