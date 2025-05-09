import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";
import { isUndefined } from "utils/index";
import { useTopStakedJurorsByCourt } from "queries/useTopStakedJurorsByCourt";
import { OrderDirection } from "src/graphql/graphql";
import { SkeletonDisputeListItem } from "components/StyledSkeleton";
import JurorCard from "./JurorCard";
import Header from "./Header";
import { ListContainer as BaseListContainer } from "pages/Home/TopJurors";

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

const DisplayJurors: React.FC = () => {
  const { id: courtId, order } = useParams();
  const [searchParams] = useSearchParams();
  const searchValue = searchParams.get("topSearch") ?? "";
  const [page, setPage] = useState(0);
  const skip = page * PER_PAGE;
  const { data, isFetching } = useTopStakedJurorsByCourt(
    courtId,
    skip,
    PER_PAGE,
    "effectiveStake",
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc,
    searchValue
  );
  const [acc, setAcc] = useState<{ id: string; userAddress: string; effectiveStake: string }[]>([]);

  useEffect(() => {
    setPage(0);
    setAcc([]);
  }, [searchValue, courtId, order]);

  useEffect(() => {
    const chunk =
      data?.jurorTokensPerCourts?.map((j) => ({
        id: j.juror.id,
        userAddress: j.juror.userAddress,
        effectiveStake: j.effectiveStake,
      })) ?? [];
    if (chunk.length) setAcc((prev) => [...prev, ...chunk]);
  }, [data]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !isFetching && acc.length % PER_PAGE === 0) setPage((p) => p + 1);
      },
      { threshold: 0.1 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [isFetching, acc.length]);

  const jurors = useMemo(() => acc, [acc]);

  return (
    <>
      {!isUndefined(jurors) && jurors.length === 0 && !isFetching ? (
        <StyledLabel>No jurors found</StyledLabel>
      ) : (
        <ListContainer>
          <Header />
          <CardsWrapper>
            {jurors.map((j) => (
              <JurorCard key={j.id} address={j.id} {...j} />
            ))}
            {isFetching && [...Array(9)].map((_, i) => <SkeletonDisputeListItem key={`s-${i}`} />)}
            <div ref={sentinelRef} />
          </CardsWrapper>
        </ListContainer>
      )}
    </>
  );
};

export default DisplayJurors;
