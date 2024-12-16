import React from "react";
import styled, { css } from "styled-components";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

const StyledLink = styled(Link)<{ $isActive: boolean }>`
  color: ${({ theme }) => theme.klerosUIComponentsPrimaryText};
  text-decoration: none;
  font-size: 16px;

  font-weight: ${({ $isActive }) => ($isActive ? "600" : "normal")};

  ${landscapeStyle(
    () => css`
      color: ${({ theme }) => theme.klerosUIComponentsWhite};
    `
  )};
`;

const links = [
  { to: "/", text: "Home" },
  { to: "/dispute-template", text: "Dispute Preview" },
  { to: "/ruler", text: "Configure Ruler" },
];

const Explore: React.FC = () => {
  const pathname = usePathname();
  const { toggleIsOpen } = useOpenContext();

  return (
    <Container>
      <Title>Explore</Title>
      {links.map(({ to, text }) => (
        <LinkContainer key={text}>
          <StyledLink
            href={to}
            onClick={toggleIsOpen}
            $isActive={to === "/" ? pathname === "/" : pathname.startsWith(to)}
          >
            {text}
          </StyledLink>
        </LinkContainer>
      ))}
    </Container>
  );
};

export default Explore;
