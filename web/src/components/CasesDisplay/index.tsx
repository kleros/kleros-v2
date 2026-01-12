import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAccount } from "wagmi";

import ArrowIcon from "svgs/icons/arrow.svg";

import { responsiveSize } from "styles/responsiveSize";

import { StyledArrowLink } from "../StyledArrowLink";

import CasesGrid, { ICasesGrid } from "./CasesGrid";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${responsiveSize(12, 24)};
`;

const StyledTitle = styled.h1`
  margin: 0px;
  font-size: ${responsiveSize(20, 24)};
`;

const StyledLabel = styled.label`
  font-size: ${responsiveSize(14, 16)};
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

interface ICasesDisplay extends ICasesGrid {
  numberDisputes?: number;
  numberClosedDisputes?: number;
  title?: string;
  className?: string;
}

const CasesDisplay: React.FC<ICasesDisplay> = ({
  disputes,
  currentPage,
  setCurrentPage,
  numberDisputes,
  numberClosedDisputes,
  casesPerPage,
  title,
  className,
  totalPages,
}) => {
  const location = useLocation();
  const { isConnected } = useAccount();
  const profileLink = isConnected ? `/profile/1/desc/all` : null;
  const { t } = useTranslation();

  return (
    <div {...{ className }}>
      <TitleContainer className="title">
        <StyledTitle>{title ?? t("navigation.cases")}</StyledTitle>
        <LinksContainer>
          {location.pathname.startsWith("/cases/display") && profileLink ? (
            <StyledArrowLink to={profileLink}>
              {t("headers.my_cases")} <ArrowIcon />
            </StyledArrowLink>
          ) : null}
          {location.pathname.startsWith("/cases/display") ? (
            <StyledArrowLink to={"/resolver"}>
              {t("buttons.create_a_case")} <ArrowIcon />
            </StyledArrowLink>
          ) : null}
        </LinksContainer>
      </TitleContainer>
      <Search />
      <StatsAndFilters totalDisputes={numberDisputes || 0} closedDisputes={numberClosedDisputes || 0} />

      {disputes?.length === 0 ? (
        <StyledLabel>{t("misc.no_cases_found")}</StyledLabel>
      ) : (
        <CasesGrid
          disputes={disputes}
          {...{
            casesPerPage,
            totalPages,
            currentPage,
            setCurrentPage,
          }}
        />
      )}
    </div>
  );
};

export default CasesDisplay;
