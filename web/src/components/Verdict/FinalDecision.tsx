import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import ArrowIcon from "svgs/icons/arrow.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { REFETCH_INTERVAL } from "consts/index";
import { Periods } from "consts/periods";
import { useReadKlerosCoreCurrentRuling } from "hooks/contracts/generated";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { useVotingHistory } from "hooks/queries/useVotingHistory";
import { useVotingContext } from "hooks/useVotingContext";
import { getLocalRounds } from "utils/getLocalRounds";
import { isUndefined } from "utils/index";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { landscapeStyle } from "styles/landscapeStyle";

import { Divider } from "../Divider";
import { StyledArrowLink } from "../StyledArrowLink";

import AnswerDisplay from "./Answer";
import RulingAndRewardsIndicators from "./RulingAndRewardsIndicators";

const Container = styled.div`
  width: 100%;
`;

const JuryContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 7px;
  flex: 1;
  h3 {
    line-height: 21px;
    margin-bottom: 0px;
  }
  > div {
    flex: 1;
  }
`;

const VerdictContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const JuryDecisionTag = styled.small`
  font-weight: 400;
  color: ${({ theme }) => theme.secondaryText};
`;

const StyledDivider = styled(Divider)`
  margin: 16px 0px;

  ${landscapeStyle(
    () => css`
      margin: 24px 0px;
    `
  )}
`;

const ReStyledArrowLink = styled(StyledArrowLink)`
  font-size: 14px;

  > svg {
    height: 15px;
    width: 15px;
  }
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
  const { data: currentRulingArray } = useReadKlerosCoreCurrentRuling({
    query: { refetchInterval: REFETCH_INTERVAL },
    args: [BigInt(id ?? 0)],
    chainId: DEFAULT_CHAIN,
  });
  const currentRuling = Number(currentRulingArray?.[0]);
  const answer = populatedDisputeData?.answers?.[currentRuling! - 1];
  const rounds = votingHistory?.dispute?.rounds;
  const jurorRewardsDispersed = useMemo(() => Boolean(rounds?.every((round) => round.jurorRewardsDispersed)), [rounds]);
  const buttonText = useMemo(() => {
    if (!wasDrawn || isDisconnected) return "Check how the jury voted";
    if (isCommitPeriod && !commited) return "Commit your vote";
    if (isVotingPeriod && isHiddenVotes && commited && !hasVoted) return "Reveal your vote";
    if (isVotingPeriod && !isHiddenVotes && !hasVoted) return "Cast your vote";
    return "Check how the jury voted";
  }, [wasDrawn, hasVoted, isCommitPeriod, isVotingPeriod, commited, isHiddenVotes, isDisconnected]);

  return (
    <Container>
      <VerdictContainer>
        {!isUndefined(Boolean(disputeDetails?.dispute?.ruled)) || jurorRewardsDispersed ? (
          <RulingAndRewardsIndicators
            ruled={Boolean(disputeDetails?.dispute?.ruled)}
            jurorRewardsDispersed={jurorRewardsDispersed}
          />
        ) : null}
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
      </VerdictContainer>
      <StyledDivider />
      {isLoading && !isDisconnected ? (
        <Skeleton width={250} height={20} />
      ) : (
        <ReStyledArrowLink to={`/cases/${id?.toString()}/voting`}>
          {buttonText} <ArrowIcon />
        </ReStyledArrowLink>
      )}
    </Container>
  );
};

export default FinalDecision;
