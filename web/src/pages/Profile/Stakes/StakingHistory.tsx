import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { responsiveSize } from "styles/responsiveSize";

import Skeleton from "react-loading-skeleton";

import { useStakingHistory } from "queries/useStakingHistory";
import { useCourtTree } from "queries/useCourtTree";

import { findCourtNameById } from "utils/findCourtNameById";
import { StandardPagination } from "@kleros/ui-components-library";

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

interface IStakingHistory {
  searchParamAddress: `0x${string}`;
  totalNumberStakingEvents: number;
}

const StakingHistory: React.FC<IStakingHistory> = ({ searchParamAddress, totalNumberStakingEvents }) => {
  const { page } = useParams();
  const navigate = useNavigate();
  const eventsPerPage = 10;
  const currentPage = parseInt(page ?? "1");
  const skip = (currentPage - 1) * eventsPerPage;

  const { data: stakingHistoryData, isLoading: isLoadingStakingHistory } = useStakingHistory(eventsPerPage, skip);
  const { data: courtTreeData, isLoading: isLoadingCourtTree } = useCourtTree();
  const stakingEvents = stakingHistoryData?.data?.userStakingEvents?.edges ?? [];
  const totalPages = useMemo(() => Math.ceil(totalNumberStakingEvents / eventsPerPage), [totalNumberStakingEvents]);

  const handlePageChange = (newPage: number) => {
    navigate(`/profile/stakes/${newPage}?address=${searchParamAddress}`);
  };

  return (
    <Container>
      <StyledTitle>Staking History</StyledTitle>
      <CourtCardsContainer>
        {isLoadingStakingHistory || isLoadingCourtTree ? (
          Array.from({ length: 10 }).map((_, index) => <Skeleton height={64} key={index} />)
        ) : (
          <>
            {stakingEvents.map(({ node, cursor }) => {
              const courtName = findCourtNameById(courtTreeData, node.args._courtID);
              return (
                <CourtCard
                  key={cursor}
                  name={courtName}
                  stake={node.args._amount}
                  id={node.args._courtID}
                  isCurrentStakeCard={false}
                  timestamp={node.blockTimestamp}
                  transactionHash={node.transactionHash}
                />
              );
            })}
            <StyledPagination currentPage={currentPage} numPages={totalPages} callback={handlePageChange} />
          </>
        )}
      </CourtCardsContainer>
    </Container>
  );
};

export default StakingHistory;
