import React from "react";

import { useTranslation } from "react-i18next";
import { Address, formatEther } from "viem";

import { Periods } from "consts/periods";
import { useIsList } from "context/IsListProvider";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";

import { DisputeDetailsFragment } from "queries/useCasesQuery";
import { useCourtPolicy } from "queries/useCourtPolicy";

import DisputeCardView from "./DisputeCardView";
import DisputeListView from "./DisputeListView";

export const getPeriodEndTimestamp = (
  lastPeriodChange: string,
  currentPeriodIndex: number,
  timesPerPeriod: string[]
) => {
  const durationCurrentPeriod = parseInt(timesPerPeriod[currentPeriodIndex]);
  return parseInt(lastPeriodChange) + durationCurrentPeriod;
};

interface IDisputeView extends DisputeDetailsFragment {
  overrideIsList?: boolean;
}

const DisputeView: React.FC<IDisputeView> = ({
  id,
  currentRoundIndex,
  arbitrated,
  period,
  lastPeriodChange,
  court,
  overrideIsList,
  currentRound,
}) => {
  const { t } = useTranslation();
  const { isList } = useIsList();
  const currentPeriodIndex = Periods[period];
  const rewards = `≥ ${formatEther(BigInt(court.feeForJuror))} ETH`;
  const date =
    currentPeriodIndex === 4
      ? parseInt(lastPeriodChange, 10)
      : getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, currentRound.timesPerPeriod);
  const {
    data: populatedDisputeDetails,
    isError,
    isPending: isLoading,
  } = usePopulatedDisputeData(id, arbitrated.id as Address);

  const { data: courtPolicy } = useCourtPolicy(court.id);
  const courtName = courtPolicy?.name;
  const category = populatedDisputeDetails?.category;
  const errMsg = isError ? t("errors.rpc_error") : t("errors.invalid_dispute_data");

  return !isList || overrideIsList ? (
    <DisputeCardView
      title={populatedDisputeDetails?.title ?? errMsg}
      disputeID={id}
      courtId={court?.id}
      court={courtName}
      period={currentPeriodIndex}
      round={parseInt(currentRoundIndex) + 1}
      showLabels
      {...{ category, rewards, date, overrideIsList, isLoading }}
    />
  ) : (
    <DisputeListView
      title={populatedDisputeDetails?.title ?? errMsg}
      disputeID={id}
      courtId={court?.id}
      court={courtName}
      period={currentPeriodIndex}
      round={parseInt(currentRoundIndex) + 1}
      {...{ category, rewards, date, isLoading }}
    />
  );
};

export default DisputeView;
