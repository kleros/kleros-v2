import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams, useNavigate } from "react-router-dom";

import { StandardPagination } from "@kleros/ui-components-library";

import { useStakingEventsByCourt } from "hooks/useStakingEventsByCourt";
import { findCourtNameById } from "utils/findCourtNameById";

import { useCourtTree } from "queries/useCourtTree";

import CourtCard from "./CourtCard";

import { CourtCardsContainer } from "./index";

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
  const totalNumberStakingEvents = stakingHistoryData?.userStakingEventsV2?.count ?? 0;
  const totalPages = useMemo(() => Math.ceil(totalNumberStakingEvents / eventsPerPage), [totalNumberStakingEvents]);

  const stakingEvents = stakingHistoryData?.userStakingEventsV2?.items ?? [];

  const handlePageChange = (newPage: number) => {
    navigate(`/profile/stakes/${newPage}?address=${searchParamAddress}`);
  };

  return (
    <div>
      <h1 className="text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] mb-5">
        {t("profile.staking_history")}
      </h1>
      <CourtCardsContainer>
        {!isLoadingStakingHistory && totalNumberStakingEvents === 0 ? (
          <label className="text-[calc(14px_+_(16_-_14)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
            {t("profile.no_history_found")}
          </label>
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
                  stake={BigInt(item.args._amount)}
                  id={item.args._courtID}
                  isCurrentStakeCard={false}
                  timestamp={parseInt(item.blockTimestamp)}
                  transactionHash={item.transactionHash}
                />
              );
            })}
            {totalPages > 1 && (
              <StandardPagination
                currentPage={currentPage}
                numPages={totalPages}
                callback={handlePageChange}
                className="mt-6 ml-auto mr-auto"
              />
            )}
          </>
        )}
      </CourtCardsContainer>
    </div>
  );
};

export default StakingHistory;
