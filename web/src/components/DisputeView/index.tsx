import React from "react";
import { formatEther } from "viem";
import { Periods } from "consts/periods";
import { useIsList } from "context/IsListProvider";
import { DisputeDetailsFragment } from "queries/useCasesQuery";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { isUndefined } from "utils/index";
import { INVALID_DISPUTE_DATA_ERROR, RPC_ERROR } from "consts/index";
import DisputeListView from "./DisputeListView";
import DisputeCardView from "./DisputeCardView";

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
}) => {
  const { isList } = useIsList();
  const currentPeriodIndex = Periods[period];
  const rewards = `≥ ${formatEther(court.feeForJuror)} ETH`;
  const date =
    currentPeriodIndex === 4
      ? lastPeriodChange
      : getPeriodEndTimestamp(lastPeriodChange, currentPeriodIndex, court.timesPerPeriod);
  const { data: disputeDetails, isError } = usePopulatedDisputeData(id, arbitrated.id as `0x${string}`);

  const { data: courtPolicy } = useCourtPolicy(court.id);
  const courtName = courtPolicy?.name;
  const category = disputeDetails?.category;
  const errMsg = isError ? RPC_ERROR : INVALID_DISPUTE_DATA_ERROR;

  return !isList || overrideIsList ? (
    <DisputeCardView
      title={disputeDetails?.title ?? errMsg}
      disputeID={id}
      courtId={court?.id}
      court={courtName}
      period={currentPeriodIndex}
      round={parseInt(currentRoundIndex) + 1}
      showLabels
      {...{ category, rewards, date, overrideIsList }}
      isLoading={isUndefined(disputeDetails)}
    />
  ) : (
    <DisputeListView
      title={disputeDetails?.title ?? errMsg}
      disputeID={id}
      courtId={court?.id}
      court={courtName}
      period={currentPeriodIndex}
      round={parseInt(currentRoundIndex) + 1}
      showLabels
      {...{ category, rewards, date }}
    />
  );
};

export default DisputeView;
