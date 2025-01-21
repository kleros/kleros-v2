import React from "react";
import styled, { css } from "styled-components";

import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import { isUndefined } from "utils/index";
import { getOneYearAgoTimestamp } from "utils/date";

import { useTopUsersByCoherenceScore } from "queries/useTopUsersByCoherenceScore";
import { useHomePageQuery } from "queries/useHomePageQuery";

import { SkeletonDisputeListItem } from "components/StyledSkeleton";
import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import JurorCard from "../Home/TopJurors/JurorCard";
import { ListContainer, StyledLabel } from "../Home/TopJurors";
import Header from "../Home/TopJurors/Header";
import { getLastOrZero } from "../Home/CourtOverview/Stats";

const Container = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.lightBackground};
  padding: 32px 16px 40px;
  max-width: ${MAX_WIDTH_LANDSCAPE};
  margin: 0 auto;

  ${landscapeStyle(
    () => css`
      padding: 48px ${responsiveSize(0, 132)} 60px;
    `
  )}
`;

const StyledTitle = styled.h1`
  margin: 0px;
  font-size: ${responsiveSize(20, 24)};
`;

const Jurors: React.FC = () => {
  const { data: queryJurors } = useTopUsersByCoherenceScore(1000);

  const jurors = queryJurors?.users?.map((juror, index) => ({
    ...juror,
    rank: index + 1,
  }));

  // const { data } = useHomePageQuery(getOneYearAgoTimestamp());
  // const totalActiveJurors = data && getLastOrZero(data["counters"], "activeJurors");

  return (
    <Container>
      <StyledTitle>Jurors Leaderboard</StyledTitle>
      <Search />
      <StatsAndFilters totalJurors={0} />

      {!isUndefined(jurors) && jurors.length === 0 ? (
        <StyledLabel>There are no jurors staked yet.</StyledLabel>
      ) : (
        <ListContainer>
          <Header />
          {!isUndefined(jurors)
            ? jurors.map((juror) => <JurorCard key={juror.rank} address={juror.id} {...juror} />)
            : [...Array(14)].map((_, i) => <SkeletonDisputeListItem key={i} />)}
        </ListContainer>
      )}
    </Container>
  );
};

export default Jurors;
