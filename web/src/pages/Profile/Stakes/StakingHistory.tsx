import React, { useMemo } from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams, useNavigate } from "react-router-dom";

import { StandardPagination } from "@kleros/ui-components-library";

import { useStakingEventsByCourt } from "hooks/useStakingEventsByCourt";
import { findCourtNameById } from "utils/findCourtNameById";

import { useCourtTree } from "queries/useCourtTree";

import { responsiveSize } from "styles/responsiveSize";

import CourtCard from "./CourtCard";

import { CourtCardsContainer } from "./index";

const Container = styled.div``;

const StyledPagination = styled(StandardPagination)`
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

const StyledTitle = styled.h1`
  font-size: ${responsiveSize(20, 24)};
  margin-bottom: 20px;
`;

const NoHistoryLabel = styled.label`
  font-size: ${responsiveSize(14, 16)};
`;

interface IStakingHistory {
  searchParamAddress: `0x${string}`;
}

const StakingHistory: React.FC<IStakingHistory> = ({ searchParamAddress }) => {
  const { t } = useTranslation();
  const { page } = useParams();
  const navigate = useNavigate();
  const eventsPerPage = 10;
  const currentPage = parseInt(page ?? "1");
  const skip = (currentPage - 1) * eventsPerPage;

  const { data: stakingHistoryData, isFetching: isLoadingStakingHistory } = useStakingEventsByCourt(
    [],
    skip,
    eventsPerPage,
    searchParamAddress
  );

  const { data: courtTreeData, isLoading: isLoadingCourtTree } = useCourtTree();
  const totalNumberStakingEvents = stakingHistoryData?.userStakingEvents?.count ?? 0;
  const totalPages = useMemo(() => Math.ceil(totalNumberStakingEvents / eventsPerPage), [totalNumberStakingEvents]);

  const stakingEvents = stakingHistoryData?.userStakingEvents?.items ?? [];

  const handlePageChange = (newPage: number) => {
    navigate(`/profile/stakes/${newPage}?address=${searchParamAddress}`);
  };

  return (
    <Container>
      <StyledTitle>{t("profile.staking_history")}</StyledTitle>
      <CourtCardsContainer>
        {!isLoadingStakingHistory && totalNumberStakingEvents === 0 ? (
          <NoHistoryLabel>{t("profile.no_history_found")}</NoHistoryLabel>
        ) : isLoadingStakingHistory || isLoadingCourtTree ? (
          Array.from({ length: 5 }).map((_, index) => <Skeleton height={64} key={index} />)
        ) : (
          <>
            {stakingEvents.map(({ item }) => {
              const courtName = findCourtNameById(courtTreeData, item.args._courtID);
              return (
                <CourtCard
                  key={item.id}
                  name={courtName ?? `Court #${item.args._courtID}`}
                  stake={item.args._amount}
                  id={item.args._courtID}
                  isCurrentStakeCard={false}
                  timestamp={parseInt(item.blockTimestamp)}
                  transactionHash={item.transactionHash}
                />
              );
            })}
            {totalPages > 1 && (
              <StyledPagination currentPage={currentPage} numPages={totalPages} callback={handlePageChange} />
            )}
          </>
        )}
      </CourtCardsContainer>
    </Container>
  );
};

export default StakingHistory;
