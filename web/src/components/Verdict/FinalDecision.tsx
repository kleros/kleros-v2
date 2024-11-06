import React, { useMemo } from "react";
import styled from "styled-components";

import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import ArrowIcon from "svgs/icons/arrow.svg";

import { REFETCH_INTERVAL } from "consts/index";
import { Periods } from "consts/periods";
import { useReadKlerosCoreCurrentRuling } from "hooks/contracts/generated";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { useVotingContext } from "hooks/useVotingContext";
import { getLocalRounds } from "utils/getLocalRounds";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { responsiveSize } from "styles/responsiveSize";

import LightButton from "../LightButton";

import AnswerDisplay from "./Answer";
import VerdictBanner from "./VerdictBanner";
import { Divider } from "../Divider";

const Container = styled.div`
  width: 100%;
`;

const JuryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  h3 {
    line-height: 21px;
    margin-bottom: 0px;
  }
`;

const JuryDecisionTag = styled.small`
  font-weight: 400;
  line-height: 19px;
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledButton = styled(LightButton)`
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  > .button-text {
    color: ${({ theme }) => theme.primaryBlue};
  }
  padding-top: 0px;
`;

const StyledDivider = styled(Divider)`
  margin: ${responsiveSize(16, 32)} 0px;
`;

interface IFinalDecision {
  arbitrable?: `0x${string}`;
}

const FinalDecision: React.FC<IFinalDecision> = ({ arbitrable }) => {
  const { id } = useParams();
  const { isDisconnected } = useAccount();
  const { data: populatedDisputeData } = usePopulatedDisputeData(id, arbitrable);
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const { wasDrawn, hasVoted, isLoading, isCommitPeriod, isVotingPeriod, commited, isHiddenVotes } = useVotingContext();
  const { data: votingHistory } = useVotingHistory(id);
  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  const ruled = disputeDetails?.dispute?.ruled ?? false;
  const periodIndex = Periods[disputeDetails?.dispute?.period ?? "evidence"];
  const navigate = useNavigate();
  const { data: currentRulingArray } = useReadKlerosCoreCurrentRuling({
    query: { refetchInterval: REFETCH_INTERVAL },
    args: [BigInt(id ?? 0)],
  });
  const currentRuling = Number(currentRulingArray?.[0]);
  const answer = populatedDisputeData?.answers?.[currentRuling! - 1];
  const buttonText = useMemo(() => {
    if (!wasDrawn || isDisconnected) return "Check how the jury voted";
    if (isCommitPeriod && !commited) return "Commit your vote";
    if (isVotingPeriod && isHiddenVotes && commited && !hasVoted) return "Reveal your vote";
    if (isVotingPeriod && !isHiddenVotes && !hasVoted) return "Cast your vote";
    return "Check how the jury voted";
  }, [wasDrawn, hasVoted, isCommitPeriod, isVotingPeriod, commited, isHiddenVotes]);

  return (
    <Container>
      <VerdictBanner ruled={ruled} />

      {ruled && (
        <JuryContainer>
          <JuryDecisionTag>The jury decided in favor of:</JuryDecisionTag>
          <AnswerDisplay {...{ answer, currentRuling }} />
        </JuryContainer>
      )}
      {!ruled && periodIndex > 1 && localRounds?.at(localRounds.length - 1)?.totalVoted > 0 && (
        <JuryContainer>
          <JuryDecisionTag>This option is winning:</JuryDecisionTag>
          <AnswerDisplay {...{ answer, currentRuling }} />
        </JuryContainer>
      )}
      <StyledDivider />
      {isLoading && !isDisconnected ? (
        <Skeleton width={250} height={20} />
      ) : (
        <StyledButton
          onClick={() => navigate(`/cases/${id?.toString()}/voting`)}
          text={buttonText}
          Icon={ArrowIcon}
          className="reverse-button"
        />
      )}
    </Container>
  );
};

export default FinalDecision;
