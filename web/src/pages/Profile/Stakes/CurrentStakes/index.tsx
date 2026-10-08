import React from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import { JurorStakeDetailsQuery } from "src/graphql/graphql";

import CourtCard from "../CourtCard";
import { CourtCardsContainer } from "../index";

import Header from "./Header";

interface ICurrentStakes {
  totalAvailableStake: bigint | undefined;
  lockedStake: bigint | undefined;
  currentStakeData: JurorStakeDetailsQuery | undefined;
  isCurrentStakeLoading: boolean;
}

const CurrentStakes: React.FC<ICurrentStakes> = ({
  totalAvailableStake,
  lockedStake,
  currentStakeData,
  isCurrentStakeLoading,
}) => {
  const { t } = useTranslation();
  const stakedCourts = currentStakeData?.jurorTokensPerCourts?.filter(({ staked }) => BigInt(staked) > 0n);
  const isStaked = stakedCourts && stakedCourts.length > 0;

  return (
    <div className="flex flex-col flex-wrap">
      <Header {...{ totalAvailableStake, lockedStake }} />
      {!isStaked && !isCurrentStakeLoading ? (
        <label className="text-[calc(14px_+_(16_-_14)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]">
          {t("profile.no_stakes_found")}
        </label>
      ) : isCurrentStakeLoading ? (
        <Skeleton />
      ) : null}
      {isStaked && !isCurrentStakeLoading ? (
        <CourtCardsContainer>
          {stakedCourts?.map(({ court: { id, name }, staked }) => (
            <CourtCard key={id} name={name ?? ""} stake={BigInt(staked)} {...{ id }} />
          ))}
        </CourtCardsContainer>
      ) : null}
    </div>
  );
};
export default CurrentStakes;
