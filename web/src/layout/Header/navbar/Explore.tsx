import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

import { Link, useLocation } from "react-router-dom";

import { useOpenContext } from "../MobileHeader";

const Container = styled.div`
  display: flex;
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

const StyledLink = styled(Link)<{ isActive: boolean; isMobileNavbar?: boolean }>`
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 16px;
  color: ${({ isActive, theme }) => (isActive ? theme.primaryText : `${theme.primaryText}BA`)};
  font-weight: ${({ isActive, isMobileNavbar }) => (isMobileNavbar && isActive ? "600" : "normal")};
  padding: 8px 8px 8px 0;
  border-radius: 7px;

  &:hover {
    color: ${({ theme, isMobileNavbar }) => (isMobileNavbar ? theme.primaryText : theme.white)} !important;
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
  { to: "/jurors/1/desc/all", text: "Jurors" },
  { to: "/get-pnk", text: "Get PNK" },
];

interface IExplore {
  isMobileNavbar?: boolean;
}

const Explore: React.FC<IExplore> = ({ isMobileNavbar }) => {
  const location = useLocation();
  const { toggleIsOpen } = useOpenContext();

  return (
    <Container>
      <Title>Explore</Title>
      {links.map(({ to, text }) => (
        <StyledLink
          key={text}
          onClick={toggleIsOpen}
          isActive={to === "/" ? location.pathname === "/" : location.pathname.split("/")[1] === to.split("/")[1]}
          {...{ to, isMobileNavbar }}
        >
          {text}
        </StyledLink>
      ))}
    </Container>
  );
};

export default Explore;
