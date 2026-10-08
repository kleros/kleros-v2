import React from "react";

import { useParams } from "react-router-dom";

import { StandardPagination } from "@kleros/ui-components-library";

import { useIsList } from "context/IsListProvider";
import useIsDesktop from "hooks/useIsDesktop";
import { cn } from "utils/cn";
import { isUndefined } from "utils/index";
import { decodeURIFilter } from "utils/uri";

import { DisputeDetailsFragment } from "queries/useCasesQuery";

import DisputeView from "components/DisputeView";

import { SkeletonDisputeCard, SkeletonDisputeListRow } from "../StyledSkeleton";

// 24px as margin-top since we already have 8px from the flex gap

export interface ICasesGrid {
  disputes?: DisputeDetailsFragment[];
  currentPage: number;
  setCurrentPage: (newPage: number) => void;
  casesPerPage: number;
  totalPages: number;
}

const CasesGrid: React.FC<ICasesGrid> = ({ disputes, casesPerPage, totalPages, currentPage, setCurrentPage }) => {
  const { filter } = useParams();
  const decodedFilter = decodeURIFilter(filter ?? "all");
  const { id: searchValue } = decodedFilter;
  const { isList } = useIsList();
  const isDesktop = useIsDesktop();

  return (
    <>
      {isList && isDesktop ? (
        <div className="flex flex-col justify-center gap-2">
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <SkeletonDisputeListRow key={i} />)
            : disputes.map((dispute) => {
                return <DisputeView key={dispute.id} {...dispute} />;
              })}
        </div>
      ) : (
        <div
          className={cn(
            "[--gap:16px] grid",
            "[grid-template-columns:repeat(auto-fill,_minmax(min(100%,_max(312px,_(100%_-_var(--gap)_*_2)/3)),_1fr))]",
            "items-stretch gap-[var(--gap)]"
          )}
        >
          {isUndefined(disputes)
            ? [...Array(casesPerPage)].map((_, i) => <SkeletonDisputeCard key={i} />)
            : disputes.map((dispute) => {
                return <DisputeView key={dispute.id} {...dispute} overrideIsList />;
              })}
        </div>
      )}

      {isUndefined(searchValue) ? (
        <StandardPagination
          currentPage={currentPage}
          numPages={Math.ceil(totalPages ?? 0)}
          callback={(page: number) => setCurrentPage(page)}
          className="mt-6 ml-auto mr-auto"
        />
      ) : null}
    </>
  );
};

export default CasesGrid;
