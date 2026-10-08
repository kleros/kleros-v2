import React, { useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { StandardPagination } from "@kleros/ui-components-library";

import useStarredCases from "hooks/useStarredCases";
import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";

import DisputeView from "components/DisputeView";
import { SkeletonDisputeCard } from "components/StyledSkeleton";

const FavoriteCases: React.FC = () => {
  const { t } = useTranslation();
  const { starredCaseIds, clearAll } = useStarredCases();

  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 3;
  const totalPages = Math.ceil(starredCaseIds.length / casesPerPage);

  const { data } = useCasesQuery((currentPage - 1) * casesPerPage, casesPerPage, {
    id_in: starredCaseIds,
  });

  const disputes: DisputeDetailsFragment[] = useMemo(() => data?.disputes as DisputeDetailsFragment[], [data]);

  return starredCaseIds.length > 0 && (isUndefined(disputes) || disputes.length > 0) ? (
    <div className="mt-[calc(24px_+_(48_-_24)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
      <div
        className={cn(
          "flex flex-row gap-3 items-center",
          "mb-[calc(12px_+_(24_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
        )}
      >
        <h1 className="m-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {t("misc.favorite_cases")}
        </h1>
        <label
          onClick={clearAll}
          className={cn(
            "[transition:0.1s] text-klerosUIComponentsPrimaryBlue cursor-pointer mt-1.5",
            "[&:hover]:text-klerosUIComponentsSecondaryBlue"
          )}
        >
          {t("buttons.clear_all")}
        </label>
      </div>
      <div
        className={cn(
          "[--gap:16px] grid",
          "[grid-template-columns:repeat(auto-fill,_minmax(min(100%,_max(312px,_(100%_-_var(--gap)_*_2)/3)),_1fr))]",
          "items-stretch gap-[var(--gap)]"
        )}
      >
        {isUndefined(disputes)
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonDisputeCard key={index} />)
          : disputes.map((dispute) => <DisputeView key={dispute.id} {...dispute} overrideIsList />)}
      </div>
      {totalPages > 1 ? (
        <StandardPagination
          currentPage={currentPage}
          numPages={totalPages}
          callback={(page: number) => setCurrentPage(page)}
          className="mt-6 ml-auto mr-auto"
        />
      ) : null}
    </div>
  ) : null;
};

export default FavoriteCases;
