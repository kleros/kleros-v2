import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { StandardPagination } from "@kleros/ui-components-library";

import { useAllUserDraws, UserDraw } from "hooks/queries/useAllUserDraws";
import { useUserDrawsCount } from "hooks/queries/useUserDraws";
import { isUndefined } from "utils/index";
import { useRootPath, decodeURIFilter } from "utils/uri";

import { OrderDirection } from "src/graphql/graphql";

import { SkeletonVoteCard } from "components/StyledSkeleton";

import StatsAndFilters from "./StatsAndFilters";
import VoteCard from "./VoteCard";

export type GroupedDraw = UserDraw & { voteCount: number };

interface IVotes {
  searchParamAddress: `0x${string}`;
}

const Votes: React.FC<IVotes> = ({ searchParamAddress }) => {
  const { t } = useTranslation();
  const { page, order, filter } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const votesPerPage = 10;
  const location = useRootPath();
  const currentPage = parseInt(page ?? "1");
  const votesSkip = votesPerPage * (currentPage - 1);
  const decodedFilter = decodeURIFilter(filter ?? "all");

  // Build the filter for draws based on ruled status
  const drawFilter = useMemo(() => {
    const baseFilter: any = {};
    if (decodedFilter?.ruled !== undefined) {
      baseFilter.dispute_ = { ruled: decodedFilter.ruled };
    }
    return Object.keys(baseFilter).length > 0 ? baseFilter : undefined;
  }, [decodedFilter]);

  // Fetch ALL draws for grouping and pagination (fetches in batches to overcome 1000 limit)
  const { data: allDraws, isLoading: isLoadingDraws } = useAllUserDraws(
    searchParamAddress,
    drawFilter,
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc
  );

  // Fetch count data for statistics
  const { data: drawsCountData } = useUserDrawsCount(searchParamAddress, drawFilter);

  const isLoadingVotes = isLoadingDraws;

  // Group draws by dispute and round, then paginate
  const { votes, totalGroupedVotes } = useMemo(() => {
    const rawDraws = allDraws ?? [];
    const groupedDrawsMap = new Map<string, { draws: UserDraw[]; mainDraw: UserDraw }>();

    rawDraws.forEach((draw) => {
      const roundId = draw.round?.id;

      if (!groupedDrawsMap.has(roundId)) {
        groupedDrawsMap.set(roundId, { draws: [], mainDraw: draw });
      }
      groupedDrawsMap.get(roundId)!.draws.push(draw);
    });

    const allGroupedDraws: GroupedDraw[] = Array.from(groupedDrawsMap.values()).map((group) => ({
      ...group.mainDraw,
      voteCount: group.draws.length,
    }));

    // Paginate the grouped draws
    const startIndex = votesSkip;
    const endIndex = startIndex + votesPerPage;
    const paginatedDraws = allGroupedDraws.slice(startIndex, endIndex);

    return {
      votes: paginatedDraws,
      totalGroupedVotes: allGroupedDraws.length,
    };
  }, [allDraws, votesSkip, votesPerPage]);

  // Get totalVotes from the totalResolvedVotes field
  const totalVotes = drawsCountData?.user?.draws?.length ?? 0;

  const resolvedVotes = drawsCountData?.user?.totalResolvedVotes
    ? parseInt(drawsCountData.user.totalResolvedVotes.toString())
    : 0;

  // Calculate votes pending from count data
  const drawsForCount = drawsCountData?.user?.draws ?? [];
  // A vote is pending if there's no vote object or if they haven't voted yet
  // Note: voted is the final action (reveal in commit-reveal courts, or direct vote in non-commit courts)
  const votesPending = drawsForCount.filter((draw: any) => !draw.vote || !draw.vote.voted).length;

  const totalPages = useMemo(
    () => (!isUndefined(totalGroupedVotes) && totalGroupedVotes > 0 ? Math.ceil(totalGroupedVotes / votesPerPage) : 1),
    [totalGroupedVotes, votesPerPage]
  );

  const handlePageChange = (newPage: number) => {
    navigate(`${location}/${newPage}/${order}/${filter}?${searchParams.toString()}`);
  };

  return (
    <div className="flex flex-col mt-[calc(24px_+_(32_-_24)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] gap-5">
      <h1 className="mb-0 text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
        {t("profile.votes")}
      </h1>
      <StatsAndFilters totalVotes={totalVotes} votesPending={votesPending} resolvedVotes={resolvedVotes} />
      {isLoadingVotes ? (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <SkeletonVoteCard key={i} />
          ))}
        </div>
      ) : votes.length > 0 ? (
        <>
          <div className="flex flex-col gap-2">
            {votes.map((vote) => (
              <VoteCard key={vote.id} vote={vote} />
            ))}
          </div>
          <StandardPagination
            currentPage={currentPage}
            numPages={totalPages}
            callback={handlePageChange}
            className="mt-6 ml-auto mr-auto"
          />
        </>
      ) : (
        <label className="text-[calc(14px_+_(16_-_14)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {t("profile.no_votes_found")}
        </label>
      )}
    </div>
  );
};

export default Votes;
