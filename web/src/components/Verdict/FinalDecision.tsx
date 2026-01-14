import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import ArrowIcon from "svgs/icons/arrow.svg";

import { DEFAULT_CHAIN } from "consts/chains";
import { REFETCH_INTERVAL } from "consts/index";
import { Periods } from "consts/periods";
import { useReadKlerosCoreCurrentRuling } from "hooks/contracts/generated";
import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { VotingHistoryQuery } from "hooks/queries/useVotingHistory";
import { useVotingContext } from "hooks/useVotingContext";
import { getLocalRounds } from "utils/getLocalRounds";

import { useDisputeDetailsQuery } from "queries/useDisputeDetailsQuery";

import { landscapeStyle } from "styles/landscapeStyle";

import { Divider } from "../Divider";
import { StyledArrowLink } from "../StyledArrowLink";

import AnswerDisplay from "./Answer";

const Container = styled.div`
  width: 100%;
`;

const JuryContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px 7px;
  flex-wrap: wrap;

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
  margin: 16px 0 0;

  ${landscapeStyle(
    () => css`
      margin: 24px 0 0;
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
  votingHistory: VotingHistoryQuery | undefined;
}

const FinalDecision: React.FC<IFinalDecision> = ({ arbitrable, votingHistory }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isDisconnected } = useAccount();
  const { data: populatedDisputeData } = usePopulatedDisputeData(id, arbitrable);
  const { data: disputeDetails } = useDisputeDetailsQuery(id);
  const { wasDrawn, hasVoted, isLoading, isCommitPeriod, isVotingPeriod, commited, isHiddenVotes } = useVotingContext();
  const localRounds = getLocalRounds(votingHistory?.dispute?.disputeKitDispute);
  const ruled = disputeDetails?.dispute?.ruled ?? false;
  const periodIndex = Periods[disputeDetails?.dispute?.period ?? "evidence"];
  const { data: currentRulingArray, isLoading: isLoadingCurrentRuling } = useReadKlerosCoreCurrentRuling({
    query: { refetchInterval: REFETCH_INTERVAL },
    args: [BigInt(id ?? 0)],
    chainId: DEFAULT_CHAIN,
  });
  const currentRuling = Number(currentRulingArray?.[0] ?? 0);

  const answer = populatedDisputeData?.answers?.find((answer) => BigInt(answer.id) === BigInt(currentRuling));
  const buttonText = useMemo(() => {
    if (!wasDrawn || isDisconnected) return t("voting.check_votes");
    if (isCommitPeriod && !commited) return t("voting.commit_your_vote");
    if (isVotingPeriod && isHiddenVotes && commited && !hasVoted) return t("voting.reveal_your_vote");
    if (isVotingPeriod && !isHiddenVotes && !hasVoted) return t("voting.cast_your_vote");
    return t("voting.check_votes");
  }, [t, wasDrawn, hasVoted, isCommitPeriod, isVotingPeriod, commited, isHiddenVotes, isDisconnected]);

  return (
    <Container>
      <VerdictContainer>
        {ruled && (
          <JuryContainer>
            <JuryDecisionTag>{t("voting.jury_decided_in_favor")}</JuryDecisionTag>
            {isLoadingCurrentRuling ? (
              <Skeleton height={14} width={60} />
            ) : (
              <AnswerDisplay {...{ answer, currentRuling }} />
            )}
          </JuryContainer>
        )}
        {!ruled && periodIndex > 1 && localRounds?.at(localRounds.length - 1)?.totalVoted > 0 && (
          <JuryContainer>
            <JuryDecisionTag>{t("voting.this_option_winning")}</JuryDecisionTag>
            {isLoadingCurrentRuling ? (
              <Skeleton height={14} width={60} />
            ) : (
              <AnswerDisplay {...{ answer, currentRuling }} />
            )}
          </JuryContainer>
        )}
        {isLoading && !isDisconnected ? (
          <Skeleton width={250} height={20} />
        ) : (
          <ReStyledArrowLink to={`/cases/${id?.toString()}/voting`}>
            {buttonText} <ArrowIcon />
          </ReStyledArrowLink>
        )}
      </VerdictContainer>
      <StyledDivider />
    </Container>
  );
};

export default FinalDecision;
