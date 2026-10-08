import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useParams } from "react-router-dom";
import { Address } from "viem";
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

import { Divider } from "../Divider";
import { StyledArrowLink } from "../StyledArrowLink";

import AnswerDisplay from "./Answer";

interface IFinalDecision {
  arbitrable?: Address;
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
    chainId: DEFAULT_CHAIN.id,
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
    <div className="w-full">
      <div className="flex flex-row items-center flex-wrap gap-2">
        {ruled && (
          <div className="flex items-center gap-[5px_7px] flex-wrap [&_h3]:leading-[21px] [&_h3]:mb-0 [&>div]:flex-1">
            <small className="font-normal text-klerosUIComponentsSecondaryText">
              {t("voting.jury_decided_in_favor")}
            </small>
            {isLoadingCurrentRuling ? (
              <Skeleton height={14} width={60} />
            ) : (
              <AnswerDisplay {...{ answer, currentRuling }} />
            )}
          </div>
        )}
        {!ruled && periodIndex > 1 && BigInt(localRounds?.[localRounds.length - 1]?.totalVoted ?? "0") > 0n && (
          <div className="flex items-center gap-[5px_7px] flex-wrap [&_h3]:leading-[21px] [&_h3]:mb-0 [&>div]:flex-1">
            <small className="font-normal text-klerosUIComponentsSecondaryText">
              {t("voting.this_option_winning")}
            </small>
            {isLoadingCurrentRuling ? (
              <Skeleton height={14} width={60} />
            ) : (
              <AnswerDisplay {...{ answer, currentRuling }} />
            )}
          </div>
        )}
        {isLoading && !isDisconnected ? (
          <Skeleton width={250} height={20} />
        ) : (
          <StyledArrowLink
            to={`/cases/${id?.toString()}/voting`}
            className="text-[14px] [&>svg]:h-[15px] [&>svg]:w-[15px]"
          >
            {buttonText} <ArrowIcon />
          </StyledArrowLink>
        )}
      </div>
      <Divider className="m-[16px_0_0] lg:m-[24px_0_0]" />
    </div>
  );
};

export default FinalDecision;
