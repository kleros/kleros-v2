import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

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
  --landscape-color: ${({ isActive, theme }) => (isActive ? theme.white : `${theme.white}BA`)};

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
      color: var(--landscape-color);
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
  const { toggleIsOpen } = useOpenContext();

  const navLinks = useMemo(
    () => [
      { to: "/cases/display/1/desc/all", text: t("navigation.cases") },
      { to: "/courts", text: t("navigation.courts") },
      { to: "/jurors/1/desc/all", text: t("navigation.jurors") },
      { to: "/get-pnk", text: t("navigation.get_pnk") },
    ],
    [t]
  );

  const currentSeg = useMemo(() => location.pathname.split("/")[1] || "", [location.pathname]);

  const getIsActive = (to: string) => to.split("?")[0].split("/")[1] === currentSeg;

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
