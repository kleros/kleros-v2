import { useEffect, useState, useRef } from "react";

import { Address } from "viem";

import { Draw_Filter, OrderDirection } from "src/graphql/graphql";

import { useUserDraws } from "./useUserDraws";

const BATCH_SIZE = 1000;

/**
 * Hook to fetch ALL user draws by fetching in batches of 1000 until complete.
 * This overcomes the GraphQL 1000 entity limit by making multiple requests.
 */
export const useAllUserDraws = (jurorAddress?: Address, where?: Draw_Filter, sortOrder?: OrderDirection) => {
  const [allDraws, setAllDraws] = useState<any[]>([]);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Track the current query params to detect changes
  const queryKey = `${jurorAddress}-${JSON.stringify(where)}-${sortOrder}`;
  const lastQueryRef = useRef(queryKey);

  // Reset when query parameters change
  if (lastQueryRef.current !== queryKey) {
    lastQueryRef.current = queryKey;
    setAllDraws([]);
    setCurrentSkip(0);
    setIsFetching(true);
    setHasMore(true);
  }

  // Fetch current batch
  const { data, isLoading, isError } = useUserDraws(jurorAddress, currentSkip, BATCH_SIZE, where, sortOrder);

  // Handle batch data
  useEffect(() => {
    if (!data?.user?.draws || isLoading) return;

    const draws = data.user.draws;

    if (draws.length === 0 && currentSkip === 0) {
      // No draws at all
      setAllDraws([]);
      setIsFetching(false);
      setHasMore(false);
      return;
    }

    // Add new draws to accumulated list
    setAllDraws((prev) => {
      if (currentSkip === 0) {
        // First batch
        return [...draws];
      }
      // Subsequent batches - avoid duplicates
      const existingIds = new Set(prev.map((d) => d.id));
      const newDraws = draws.filter((d) => !existingIds.has(d.id));
      return [...prev, ...newDraws];
    });

    // Check if we need more batches
    if (draws.length < BATCH_SIZE) {
      // Got fewer than requested, we're done
      setIsFetching(false);
      setHasMore(false);
    } else {
      // Need to fetch more
      setCurrentSkip((prev) => prev + BATCH_SIZE);
    }
  }, [data, isLoading, currentSkip]);

  return {
    data: allDraws,
    isLoading: isFetching || (isLoading && hasMore),
    isError,
  };
};
