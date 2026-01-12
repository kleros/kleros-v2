import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { landscapeStyle } from "styles/landscapeStyle";

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
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toggleIsOpen } = useOpenContext();
  const { isConnected } = useAccount();

  const navLinks = useMemo(() => {
    const base = [
      { to: "/", text: t("navigation.home") },
      { to: "/cases/display/1/desc/all", text: t("navigation.cases") },
      { to: "/courts", text: t("navigation.courts") },
      { to: "/jurors/1/desc/all", text: t("navigation.jurors") },
      { to: "/get-pnk", text: t("navigation.get_pnk") },
    ];
    if (isConnected) {
      base.push({ to: "/profile/1/desc/all", text: t("navigation.my_profile") });
    }
    return base;
  }, [isConnected, t]);

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
      <Title>{t("navigation.overview")}</Title>
      {navLinks.map(({ to, text }) => (
        <StyledLink key={text} onClick={toggleIsOpen} isActive={getIsActive(to)} {...{ to, isMobileNavbar }}>
          {text}
        </StyledLink>
      ))}
    </Container>
  );
};

export default Explore;
