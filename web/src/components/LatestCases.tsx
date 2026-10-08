import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

import { DisputeDetailsFragment, useCasesQuery } from "queries/useCasesQuery";

import DisputeView from "components/DisputeView";
import { SkeletonDisputeCard } from "components/StyledSkeleton";

import { Dispute_Filter } from "../graphql/graphql";

import SeeAllCasesButton from "./SeeAllCasesButton";

interface ILatestCases {
  title?: string;
  filters?: Dispute_Filter;
}

const LatestCases: React.FC<ILatestCases> = ({ title, filters }) => {
  const { t } = useTranslation();
  const { data } = useCasesQuery(0, 3, filters);
  const disputes: DisputeDetailsFragment[] = useMemo(() => data?.disputes as DisputeDetailsFragment[], [data]);
  const courtId = typeof filters?.court === "string" ? filters?.court : undefined;

  return isUndefined(disputes) || disputes.length > 0 ? (
    <div className="mt-[calc(32px_+_(48_-_32)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
      <div
        className={cn(
          "flex flex-wrap flex-row items-center gap-[4px_12px]",
          "mb-[calc(12px_+_(24_-_12)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]"
        )}
      >
        <h1 className="mb-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {title ?? t("misc.latest_cases")}
        </h1>
        <SeeAllCasesButton {...{ courtId }} />
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
    </div>
  ) : null;
};

export default LatestCases;
