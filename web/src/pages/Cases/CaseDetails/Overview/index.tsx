import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";
import { Address, formatEther } from "viem";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { useDisputeKitInfo } from "hooks/useDisputeKitInfo";
import { getLocalRounds } from "utils/getLocalRounds";

import { useCourtPolicy } from "queries/useCourtPolicy";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { isUndefined } from "src/utils";

import { landscapeStyle } from "styles/landscapeStyle";

import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import DisputeInfo from "components/DisputeView/DisputeInfo";
import { Divider } from "components/Divider";
import Verdict from "components/Verdict/index";

const Container = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 16px 16px;

  ${landscapeStyle(
    () => css`
      padding: 32px;
      gap: 24px;
    `
  )}
`;

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
      <Container>
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
      </Container>
      <Policies
        disputePolicyURI={disputeDetails?.policyURI}
        courtId={courtID}
        attachment={disputeDetails?.attachment}
      />
    </>
  );
};

export default Overview;
