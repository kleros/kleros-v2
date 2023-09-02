import React from "react";
import styled, { css } from "styled-components";
import { smallScreenStyle } from "styles/smallScreenStyle";
import { Link, useLocation } from "react-router-dom";
import { useOpenContext } from "../MobileHeader";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: calc(4px + (16 - 4) * ((100vw - 375px) / (1250 - 375)));
  ${smallScreenStyle(
    () => css`
      flex-direction: column;
      gap: 0px;
    `
  )};
`;

const LinkContainer = styled.div`
  display: flex;
  .sm-link {
    color: ${({ theme }) => theme.white};
    text-decoration: none;
    font-size: 16px;
    &.active-link {
      font-weight: 600;
    }
  }
  ${smallScreenStyle(
    () => css`
      min-height: 32px;
      display: flex;
      align-items: center;
      .sm-link {
        color: ${({ theme }) => theme.primaryText};
      }
    `
  )};
`;

const Title = styled.h1`
  display: none;
  ${smallScreenStyle(
    () => css`
      display: block;
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
          <Link
            {...{ to }}
            onClick={toggleIsOpen}
            className={`sm-link ${location.pathname.startsWith(to) ? "active-link" : ""}`}
          >
            {text}
          </Link>
        </LinkContainer>
      ))}
    </Container>
  );
};

export default Explore;
