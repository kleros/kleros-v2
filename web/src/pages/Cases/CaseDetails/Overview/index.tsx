import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useParams } from "react-router-dom";
import { formatEther } from "viem";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { getLocalRounds } from "utils/getLocalRounds";

import { useCourtPolicy } from "queries/useCourtPolicy";
import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { landscapeStyle } from "styles/landscapeStyle";

import { DisputeContext } from "components/DisputePreview/DisputeContext";
import { Policies } from "components/DisputePreview/Policies";
import DisputeInfo from "components/DisputeView/DisputeInfo";
import Verdict from "components/Verdict/index";
import { Divider } from "components/Divider";

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
  arbitrable?: `0x${string}`;
  courtID?: string;
  currentPeriodIndex: number;
}

const Overview: React.FC<IOverview> = ({ arbitrable, courtID, currentPeriodIndex }) => {
  const { id } = useParams();
  const { data: disputeDetails, isError } = usePopulatedDisputeData(id, arbitrable);
  const { data: dispute } = useDisputeDetailsQuery(id);
  const { data: courtPolicy } = useCourtPolicy(courtID);
  const { data: votingHistory } = useVotingHistory(id);
  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  const courtName = courtPolicy?.name;
  const court = dispute?.dispute?.court;
  const rewards = useMemo(() => (court ? `≥ ${formatEther(court.feeForJuror)} ETH` : undefined), [court]);
  const category = disputeDetails?.category;

  return (
    <>
      <Container>
        <DisputeContext disputeDetails={disputeDetails} isRpcError={isError} />
        <Divider />

        <Verdict arbitrable={arbitrable} />
        <Divider />

        <DisputeInfo
          isOverview={true}
          overrideIsList={true}
          courtId={court?.id}
          court={courtName}
          round={localRounds?.length}
          {...{ rewards, category }}
        />
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
