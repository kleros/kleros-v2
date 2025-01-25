import React from "react";
import styled, { css } from "styled-components";

import { MAX_WIDTH_LANDSCAPE, landscapeStyle } from "styles/landscapeStyle";
import { responsiveSize } from "styles/responsiveSize";

import Skeleton from "react-loading-skeleton";
import { useAccount } from "wagmi";

import { isUndefined } from "utils/index";

import { useTotalLeaderboardJurors } from "queries/useTotalLeaderboardJurors";

import ArrowIcon from "svgs/icons/arrow.svg";

import Search from "./Search";
import StatsAndFilters from "./StatsAndFilters";
import DisplayJurors from "./DisplayJurors";
import { StyledArrowLink } from "components/StyledArrowLink";
import ConnectWallet from "components/ConnectWallet";

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

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: ${responsiveSize(12, 24)};
  gap: 4px;
`;

const StyledTitle = styled.h1`
  margin: 0px;
  font-size: ${responsiveSize(20, 24)};
`;

const Jurors: React.FC = () => {
  const { data: queryTotalLeaderBoardJurors } = useTotalLeaderboardJurors();
  const totalLeaderboardJurors = queryTotalLeaderBoardJurors?.counter?.totalLeaderboardJurors;
  const { isConnected } = useAccount();

  return (
    <Container>
      <Header>
        <StyledTitle>Jurors Leaderboard</StyledTitle>
        {isConnected ? (
          <StyledArrowLink to={"/profile/1/desc/all"}>
            My Profile <ArrowIcon />
          </StyledArrowLink>
        ) : (
          <ConnectWallet />
        )}
      </Header>
      <Search />
      <StatsAndFilters totalJurors={totalLeaderboardJurors} />
      {!isUndefined(totalLeaderboardJurors) && Number(totalLeaderboardJurors) > 0 ? (
        <DisplayJurors totalLeaderboardJurors={Number(totalLeaderboardJurors)} />
      ) : (
        <Skeleton height={1000} />
      )}
    </Container>
  );
};

export default Jurors;
