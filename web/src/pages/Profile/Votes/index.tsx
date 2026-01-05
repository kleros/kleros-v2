import React, { useMemo } from "react";
import styled from "styled-components";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { StandardPagination } from "@kleros/ui-components-library";

import { useAllUserDraws } from "hooks/queries/useAllUserDraws";
import { useUserDrawsCount } from "hooks/queries/useUserDraws";
import { isUndefined } from "utils/index";
import { useRootPath, decodeURIFilter } from "utils/uri";

import { OrderDirection } from "src/graphql/graphql";

import { responsiveSize } from "styles/responsiveSize";

import { SkeletonVoteCard } from "components/StyledSkeleton";

import StatsAndFilters from "./StatsAndFilters";
import VoteCard from "./VoteCard";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${responsiveSize(24, 32)};
  gap: 20px;
`;

const StyledTitle = styled.h1`
  margin-bottom: 0;
  font-size: ${responsiveSize(20, 24)};
`;

const StyledPagination = styled(StandardPagination)`
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

const VotesCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface IVotes {
  searchParamAddress: `0x${string}`;
}

const Votes: React.FC<IVotes> = ({ searchParamAddress }) => {
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
    const groupedDrawsMap = new Map<string, { draws: any[]; mainDraw: any }>();

    rawDraws.forEach((draw: any) => {
      const roundId = draw.round?.id;

      if (!groupedDrawsMap.has(roundId)) {
        groupedDrawsMap.set(roundId, { draws: [], mainDraw: draw });
      }
      groupedDrawsMap.get(roundId)!.draws.push(draw);
    });

    const allGroupedDraws = Array.from(groupedDrawsMap.values()).map((group) => ({
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
    <Container>
      <StyledTitle>Votes</StyledTitle>
      <StatsAndFilters totalVotes={totalVotes} votesPending={votesPending} resolvedVotes={resolvedVotes} />
      <VotesCardContainer>
        {isLoadingVotes
          ? [...Array(votesPerPage)].map((_, i) => <SkeletonVoteCard key={i} />)
          : votes.length > 0
            ? votes.map((vote: any) => <VoteCard key={vote.id} vote={vote} />)
            : null}
      </VotesCardContainer>
      <StyledPagination currentPage={currentPage} numPages={totalPages} callback={handlePageChange} />
    </Container>
  );
};

export default Votes;
