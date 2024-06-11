import React from "react";
import styled, { css } from "styled-components";

import { Link, useLocation } from "react-router-dom";

import { landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { useOpenContext } from "../MobileHeader";

const Container = styled.div`
  display: flex;
  gap: 0px;
  flex-direction: column;

  ${landscapeStyle(
    () => css`
      flex-direction: row;
      gap: ${responsiveSize(4, 16)};
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

const StyledLink = styled(Link)<{ isActive: boolean }>`
  color: ${({ theme }) => theme.primaryText};
  text-decoration: none;
  font-size: 16px;

  font-weight: ${({ isActive }) => (isActive ? "600" : "normal")};

  ${landscapeStyle(
    () => css`
      color: ${({ theme }) => theme.white};
    `
  )};
`;

const HiddenLink = styled(StyledLink)<{ isActive: boolean }>`
  color: ${({ isActive, theme }) => (isActive ? theme.primaryText : "transparent")};
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
  const { isOpen, toggleIsOpen } = useOpenContext();

  return (
    <Container>
      <Title>Explore</Title>
      {links.map(({ to, text }) => (
        <LinkContainer key={text}>
          <StyledLink
            to={to}
            onClick={toggleIsOpen}
            isActive={to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)}
          >
            {text}
          </StyledLink>
        </LinkContainer>
      ))}
      {!isOpen && (
        <LinkContainer>
          <HiddenLink
            to="/dispute-template"
            onClick={toggleIsOpen}
            isActive={location.pathname.startsWith("/dispute-template")}
          >
            Dev
          </HiddenLink>
        </LinkContainer>
      )}
    </Container>
  );
};

export default Explore;
