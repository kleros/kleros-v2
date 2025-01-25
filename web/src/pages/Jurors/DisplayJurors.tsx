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
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const jurorsPerPage = isDesktop ? 20 : 10;
  const currentPage = parseInt(page ?? "1");

  const jurorSkip = jurorsPerPage * (currentPage - 1);

  const { data: queryJurors } = useJurorsByCoherenceScore(
    jurorSkip,
    jurorsPerPage,
    "coherenceScore",
    order === "asc" ? OrderDirection.Asc : OrderDirection.Desc
  );

  const jurors = useMemo(
    () =>
      queryJurors?.users?.map((juror, index) => ({
        ...juror,
        rank: jurorSkip + index + 1,
      })),
    [queryJurors, jurorSkip]
  );

  const totalPages = useMemo(
    () => Math.ceil(totalLeaderboardJurors / jurorsPerPage),
    [totalLeaderboardJurors, jurorsPerPage]
  );

  const handlePageChange = (newPage: number) => {
    navigate(`/jurors/${newPage}/${order}/${filter}`);
  };

  return (
    <>
      {!isUndefined(jurors) && jurors.length === 0 ? (
        <StyledLabel>There are no jurors staked yet.</StyledLabel>
      ) : (
        <>
          <ListContainer>
            <Header />
            {!isUndefined(jurors)
              ? jurors.map((juror) => <JurorCard key={juror.rank} address={juror.id} {...juror} />)
              : [...Array(jurorsPerPage)].map((_, i) => <SkeletonDisputeListItem key={i} />)}
          </ListContainer>
          <StyledPagination currentPage={currentPage} numPages={totalPages} callback={handlePageChange} />
        </>
      )}
    </>
  );
};

export default DisplayJurors;
