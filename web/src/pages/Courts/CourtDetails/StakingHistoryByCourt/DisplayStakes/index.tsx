import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import { useParams, useSearchParams } from "react-router-dom";

import { useStakingEventsByCourt } from "hooks/useStakingEventsByCourt";
import { findCourtNameById } from "utils/findCourtNameById";
import { isUndefined } from "utils/index";

import { useCourtTree, CourtTreeQuery } from "queries/useCourtTree";

import { responsiveSize } from "styles/responsiveSize";

import { SkeletonDisputeListItem } from "components/StyledSkeleton";
import { ListContainer as BaseListContainer } from "pages/Home/TopJurors";

import Header from "./Header";
import StakeEventCard from "./StakeEventCard";

const ListContainer = styled(BaseListContainer)`
  overflow: visible;
`;

const CardsWrapper = styled.div`
  max-height: 520px;
  overflow-y: hidden;

  &:hover {
    overflow-y: auto;
  }
`;

const StyledLabel = styled.label`
  display: flex;
  font-size: 16px;
  margin-top: ${responsiveSize(12, 20)};
`;

const PER_PAGE = 30;

const getAllChildCourtIds = (court: CourtTreeQuery["court"], courtId: string): number[] => {
  if (!court) return [];

  const ids: number[] = [];

  const collectAllDescendants = (node: CourtTreeQuery["court"]) => {
    ids.push(parseInt(node.id));
    if (node.children) {
      node.children.forEach((child) => collectAllDescendants(child));
    }
  };

  const findAndCollect = (node: CourtTreeQuery["court"]): boolean => {
    if (node.id === courtId) {
      collectAllDescendants(node);
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (findAndCollect(child)) return true;
      }
    }
    return false;
  };

  findAndCollect(court);
  return ids;
};

const DisplayStakes: React.FC = () => {
  const { id: courtId } = useParams();
  const [searchParams] = useSearchParams();
  const searchValue = searchParams.get("stakeSearch") ?? "";
  const [page, setPage] = useState(0);
  const skip = page * PER_PAGE;

  const { data: courtTree } = useCourtTree();

  const courtIds = useMemo(() => {
    if (!courtId || !courtTree?.court) return [];
    return getAllChildCourtIds(courtTree.court, courtId);
  }, [courtId, courtTree]);

  const { data, isFetching } = useStakingEventsByCourt(courtIds, skip, PER_PAGE, searchValue || undefined);

  const [acc, setAcc] = useState<
    Array<{
      id: string;
      address: string;
      stake: string;
      timestamp: string;
      transactionHash: string;
      courtId: number;
      courtName: string;
    }>
  >([]);

  useEffect(() => {
    setPage(0);
    setAcc([]);
  }, [searchValue, courtId]);

  useEffect(() => {
    const allItems = data?.userStakingEvents?.items ?? [];

    const filteredItems = allItems.filter((item) => {
      const itemCourtId = item.item.args._courtID;
      return courtIds.includes(parseInt(itemCourtId));
    });

    const chunk = filteredItems.map((item) => {
      const itemCourtId = item.item.args._courtID;
      const courtName = findCourtNameById(courtTree, itemCourtId);

      return {
        id: item.item.id,
        address: item.item.args._address,
        stake: item.item.args._amount,
        timestamp: item.item.blockTimestamp,
        transactionHash: item.item.transactionHash,
        courtId: parseInt(itemCourtId),
        courtName: courtName ?? `Court #${itemCourtId}`,
      };
    });

    if (chunk.length) {
      setAcc((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const next = chunk.filter((item) => !seen.has(item.id));
        return next.length ? [...prev, ...next] : prev;
      });
    }
  }, [data, courtIds, courtTree]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

const [acc, setAcc] = useState<
  Array<{
    id: string;
    address: string;
    stake: string;
    timestamp: string;
    transactionHash: string;
    courtId: number;
    courtName: string;
  }>
>([]);
const [hasMore, setHasMore] = useState(true);

useEffect(() => {
  setPage(0);
  setAcc([]);
  setHasMore(true);
}, [searchValue, courtId]);

useEffect(() => {
  const allItems = data?.userStakingEvents?.items ?? [];

  const filteredItems = allItems.filter((item) => {
    const itemCourtId = item.item.args._courtID;
    return courtIds.includes(parseInt(itemCourtId));
  });

  const chunk = filteredItems.map((item) => {
    const itemCourtId = item.item.args._courtID;
    const courtName = findCourtNameById(courtTree, itemCourtId);

    return {
      id: item.item.id,
      address: item.item.args._address,
      stake: item.item.args._amount,
      timestamp: item.item.blockTimestamp,
      transactionHash: item.item.transactionHash,
      courtId: parseInt(itemCourtId),
      courtName: courtName ?? `Court #${itemCourtId}`,
    };
  });

  const sortedChunk = chunk.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
  
  // Stop fetching if we received fewer items than requested
  if (sortedChunk.length < PER_PAGE) {
    setHasMore(false);
  }

  if (sortedChunk.length) {
    setAcc((prev) => {
      const seen = new Set(prev.map((item) => item.id));
      const next = sortedChunk.filter((item) => !seen.has(item.id));
      return next.length ? [...prev, ...next] : prev;
    });
  }
}, [data, courtIds, courtTree]);

const sentinelRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  const sentinel = sentinelRef.current;
  if (!sentinel) return;
  const obs = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !isFetching && hasMore) setPage((p) => p + 1);
    },
    { threshold: 0.1 }
  );
  obs.observe(sentinel);
  return () => obs.disconnect();
}, [isFetching, hasMore]);

  const stakes = useMemo(() => acc, [acc]);

  return (
    <>
      {!isUndefined(stakes) && stakes.length === 0 && !isFetching ? (
        <StyledLabel>No stakes found</StyledLabel>
      ) : (
        <ListContainer>
          <Header />
          <CardsWrapper>
            {stakes.map((s) => (
              <StakeEventCard
                key={s.id}
                address={s.address}
                stake={s.stake}
                timestamp={s.timestamp}
                transactionHash={s.transactionHash}
                courtName={s.courtName}
                courtId={s.courtId}
                currentCourtId={courtId ? parseInt(courtId) : undefined}
              />
            ))}
            {isFetching && [...Array(9)].map((_, i) => <SkeletonDisputeListItem key={`s-${i}`} />)}
            <div ref={sentinelRef} />
          </CardsWrapper>
        </ListContainer>
      )}
    </>
  );
};

export default DisplayStakes;
