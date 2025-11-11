import React from "react";
import styled from "styled-components";

import { useLocation } from "react-router-dom";

import ArrowIcon from "svgs/icons/arrow.svg";

import { responsiveSize } from "styles/responsiveSize";

import { useWallet } from "context/walletProviders";
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
  title = "Cases",
  className,
  totalPages,
}) => {
  const location = useLocation();
  const { isConnected } = useWallet();
  const profileLink = isConnected ? `/profile/1/desc/all` : null;

  return (
    <div {...{ className }}>
      <TitleContainer className="title">
        <StyledTitle>{title}</StyledTitle>
        <LinksContainer>
          {location.pathname.startsWith("/cases/display") && profileLink ? (
            <StyledArrowLink to={profileLink}>
              My Cases <ArrowIcon />
            </StyledArrowLink>
          ) : null}
          {location.pathname.startsWith("/cases/display") ? (
            <StyledArrowLink to={"/resolver"}>
              Create a case <ArrowIcon />
            </StyledArrowLink>
          ) : null}
        </LinksContainer>
      </TitleContainer>
      <Search />
      <StatsAndFilters totalDisputes={numberDisputes || 0} closedDisputes={numberClosedDisputes || 0} />

      {disputes?.length === 0 ? (
        <StyledLabel>No cases found</StyledLabel>
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
