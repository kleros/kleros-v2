import React from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAccount } from "wagmi";

import ArrowIcon from "svgs/icons/arrow.svg";

import { cn } from "utils/cn";

import { StyledArrowLink } from "../StyledArrowLink";

import CasesGrid, { ICasesGrid } from "./CasesGrid";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";

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
  const profileLink = isConnected ? `/profile/cases/1/desc/all` : null;
  const { t } = useTranslation();

  return (
    <div {...{ className }}>
      <div
        className={cn(
          "flex justify-between items-center flex-wrap",
          "mb-[calc(12px_+_(24_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]",
          "title"
        )}
      >
        <h1 className="m-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {title ?? t("navigation.cases")}
        </h1>
        <div className="flex flex-row gap-4">
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
        </div>
      </div>
      <Search />
      <StatsAndFilters totalDisputes={numberDisputes || 0} closedDisputes={numberClosedDisputes || 0} />

      {disputes?.length === 0 ? (
        <label className="text-[calc(14px_+_(16_-_14)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {t("misc.no_cases_found")}
        </label>
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
