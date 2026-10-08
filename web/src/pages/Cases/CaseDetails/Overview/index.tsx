import React, { useMemo } from "react";

import { useParams } from "react-router-dom";
import { Address, formatEther } from "viem";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { useDisputeKitInfo } from "hooks/useDisputeKitInfo";
import { getLocalRounds } from "utils/getLocalRounds";

import { useCourtPolicy } from "queries/useCourtPolicy";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { isUndefined } from "src/utils";

import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import DisputeInfo from "components/DisputeView/DisputeInfo";
import { Divider } from "components/Divider";
import Verdict from "components/Verdict/index";

interface IOverview {
  arbitrable?: Address;
  courtID?: string;
  currentPeriodIndex: number;
}

const Overview: React.FC<IOverview> = ({ arbitrable, courtID }) => {
  const { id } = useParams();
  const { data: disputeDetails, isError } = usePopulatedDisputeData(id, arbitrable);
  const { data: dispute } = useDisputeDetailsQuery(id);
  const { data: courtPolicy } = useCourtPolicy(courtID);
  const { data: votingHistory } = useVotingHistory(id);
  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  const courtName = courtPolicy?.name;
  const court = dispute?.dispute?.court;
  const rewards = useMemo(() => (court ? `≥ ${formatEther(BigInt(court.feeForJuror))} ETH` : undefined), [court]);
  const category = disputeDetails?.category;

  const disputeKitAddress = dispute?.dispute?.currentRound.disputeKit?.address ?? undefined;
  const currentRoundIndex = Number.parseInt(dispute?.dispute?.currentRoundIndex ?? "0", 10);
  const disputeKitInfo = useDisputeKitInfo({ disputeKitAddress });

  const DisputeKitOverviewExtraInfoComponent = disputeKitInfo?.OverviewExtraInfo;
  return (
    <>
      <div className="w-full h-auto flex flex-col gap-4 p-[20px_16px_16px] lg:p-8 lg:gap-6">
        <DisputeContext isRpcError={isError} disputeId={id} {...{ votingHistory, disputeDetails, dispute }} />
        <Divider />

        <Verdict {...{ arbitrable, votingHistory }} />
        <Divider />

        <DisputeInfo
          isOverview={true}
          courtId={court?.id}
          court={courtName}
          round={localRounds?.length}
          {...{ rewards, category }}
        />
        {!isUndefined(id) && !isUndefined(disputeKitAddress) && DisputeKitOverviewExtraInfoComponent ? (
          <DisputeKitOverviewExtraInfoComponent disputeId={id} {...{ disputeKitAddress, currentRoundIndex }} />
        ) : null}
      </div>
      <Policies
        disputePolicyURI={disputeDetails?.policyURI}
        courtId={courtID}
        attachment={disputeDetails?.attachment}
      />
    </>
  );
};

export default Overview;
