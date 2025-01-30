import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { isUndefined } from "utils/index";
import { StandardPagination } from "@kleros/ui-components-library";

import { useJurorsByCoherenceScore } from "queries/useJurorsByCoherenceScore";
import useIsDesktop from "hooks/useIsDesktop";

import { OrderDirection } from "src/graphql/graphql";

import { SkeletonDisputeListItem } from "components/StyledSkeleton";
import JurorCard from "../Home/TopJurors/JurorCard";
import { ListContainer, StyledLabel } from "../Home/TopJurors";
import Header from "../Home/TopJurors/Header";
import { decodeURIFilter } from "utils/uri";

interface IDisplayJurors {
  totalLeaderboardJurors: number;
}

const StyledPagination = styled(StandardPagination)`
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

const DisplayJurors: React.FC<IDisplayJurors> = ({ totalLeaderboardJurors }) => {
  const { page, order, filter } = useParams();
  const { id: searchValue } = decodeURIFilter(filter ?? "all");
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const jurorsPerPage = isDesktop ? 20 : 10;
  const currentPage = parseInt(page ?? "1");
  const jurorSkip = jurorsPerPage * (currentPage - 1);
  const { data: queryJurors } = useJurorsByCoherenceScore(
    jurorSkip,
    jurorsPerPage,
    "coherenceScore",
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc,
    searchValue || ""
  );

  const jurors = useMemo(() => {
    const baseJurors = queryJurors?.users?.map((juror, index) => ({
      ...juror,
      rank: searchValue ? undefined : jurorSkip + index + 1,
    }));
    if (!searchValue && order === "asc" && baseJurors) {
      return baseJurors.map((juror) => ({
        ...juror,
        rank: totalLeaderboardJurors - (juror.rank || 0) + 1,
      }));
    }
    return baseJurors;
  }, [queryJurors, jurorSkip, order, totalLeaderboardJurors, searchValue]);

  const totalPages = useMemo(
    () => (!isUndefined(totalLeaderboardJurors) ? Math.ceil(totalLeaderboardJurors / jurorsPerPage) : 1),
    [totalLeaderboardJurors, jurorsPerPage]
  );

  const handlePageChange = (newPage: number) => {
    navigate(`/jurors/${newPage}/${order}/${filter}`);
  };

  return (
    <>
      {isUndefined(totalLeaderboardJurors) ? (
        <>
          <ListContainer>
            <Header />
            {[...Array(jurorsPerPage)].map((_, i) => (
              <SkeletonDisputeListItem key={i} />
            ))}
          </ListContainer>
          {!searchValue && (
            <StyledPagination currentPage={currentPage} numPages={totalPages} callback={handlePageChange} />
          )}
        </>
      ) : (
        <ListContainer>
          {!isUndefined(jurors) && jurors.length === 0 ? (
            <StyledLabel>No jurors found</StyledLabel>
          ) : (
            <>
              <Header />
              {!isUndefined(jurors)
                ? jurors.map((juror) => <JurorCard key={juror.id} address={juror.id} {...juror} />)
                : [...Array(jurorsPerPage)].map((_, i) => <SkeletonDisputeListItem key={i} />)}
              {!searchValue && (
                <StyledPagination currentPage={currentPage} numPages={totalPages} callback={handlePageChange} />
              )}
            </>
          )}
        </ListContainer>
      )}
    </>
  );
};

export default DisplayJurors;
