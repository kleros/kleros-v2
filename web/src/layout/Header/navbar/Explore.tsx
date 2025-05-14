import React, { useMemo } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";

import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAccount } from "wagmi";

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

interface IExplore {
  isMobileNavbar?: boolean;
}

const Explore: React.FC<IExplore> = ({ isMobileNavbar }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toggleIsOpen } = useOpenContext();
  const { isConnected } = useAccount();

  const navLinks = useMemo(() => {
    const base = [
      { to: "/", text: "Home" },
      { to: "/cases/display/1/desc/all", text: "Cases" },
      { to: "/courts", text: "Courts" },
      { to: "/jurors/1/desc/all", text: "Jurors" },
      { to: "/get-pnk", text: "Get PNK" },
    ];
    if (isConnected) {
      base.push({ to: "/profile/1/desc/all", text: "My Profile" });
    }
    return base;
  }, [isConnected]);

  const currentSeg = useMemo(() => location.pathname.split("/")[1] || "", [location.pathname]);
  const ownsProfile = !searchParams.get("address");

  const getIsActive = (to: string) => {
    const path = to.split("?")[0];
    if (path === "/") return location.pathname === "/";
    const targetSeg = path.split("/")[1] || "";
    if (targetSeg !== currentSeg) return false;
    return targetSeg !== "profile" || ownsProfile;
  };

  return (
    <Container>
      <Title>Explore</Title>
      {navLinks.map(({ to, text }) => (
        <StyledLink key={text} onClick={toggleIsOpen} isActive={getIsActive(to)} {...{ to, isMobileNavbar }}>
          {text}
        </StyledLink>
      ))}
    </Container>
  );
};

export default Explore;
