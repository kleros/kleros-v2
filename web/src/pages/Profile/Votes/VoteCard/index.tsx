import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Address } from "viem";

import { Card as _Card } from "@kleros/ui-components-library";

import ArrowIcon from "svgs/icons/arrow.svg";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { cn } from "utils/cn";
import { isUndefined } from "utils/index";

import { StyledArrowLink } from "components/StyledArrowLink";
import { GroupedDraw } from "pages/Profile/Votes";

import CaseNumber from "./CaseNumber";
import CaseStatus from "./CaseStatus";
import CourtName from "./CourtName";
import Round from "./Round";
import Vote from "./Vote";
import VoteCount from "./VoteCount";

interface IVoteCard {
  vote: GroupedDraw;
}

const VoteCard: React.FC<IVoteCard> = ({ vote: draw }) => {
  const { t } = useTranslation();

  // Extract dispute data from draw
  const courtName = draw.dispute?.court?.name || t("misc.unknown_court");
  const courtId = draw.dispute?.court?.id || "0";
  const caseId = draw.dispute?.disputeID || "0";

  // Extract the round number from draw.round.id (format: "disputeID-roundIndex")
  const roundIndex = draw.round?.id?.split("-").pop() || "0";
  const roundNumber = (parseInt(roundIndex) + 1).toString();

  const arbitrableAddress = draw.dispute?.arbitrated?.id as Address | undefined;
  const voteCount = draw.voteCount || 1;

  // Extract vote data (may be null if juror didn't vote)
  const voteData = draw.vote;
  const period = draw.dispute?.period || "";
  const hiddenVotes = draw.dispute?.court?.hiddenVotes || false;
  const currentRoundIndex = parseInt(draw.dispute?.currentRoundIndex ?? 0);
  const roundIndexNum = parseInt(roundIndex);
  const isActiveRound = currentRoundIndex === roundIndexNum;

  // Fetch dispute details to get the answer labels
  const { data: populatedDisputeData, isLoading: isLoadingDisputeData } = usePopulatedDisputeData(
    draw.dispute?.id,
    arbitrableAddress
  );

  // Determine the vote choice text based on the dispute template
  // Using same logic as in Cases/CaseDetails/Voting/VotesDetails/AccordionTitle.tsx
  const voteChoice = useMemo(() => {
    const choice = voteData?.choice;
    const commited = Boolean(voteData?.commited);

    // For hidden votes courts
    if (hiddenVotes) {
      if (!commited && (isActiveRound ? ["vote", "appeal", "execution"].includes(period) : true)) {
        return t("voting.did_not_commit_vote");
      }

      if (["evidence", "commit"].includes(period)) {
        return commited ? t("voting.vote_committed") : t("voting.pending_vote_commitment");
      }
    }

    // For all courts - check if they voted
    if (isUndefined(choice) && (isActiveRound ? ["appeal", "execution"].includes(period) : true)) {
      return t("voting.did_not_vote");
    }

    // If choice is still undefined, show pending
    if (isUndefined(choice)) {
      return t("voting.pending_vote");
    }

    const choiceNum = parseInt(choice.toString());

    // Choice 0 is always "Refuse to Arbitrate"
    if (choiceNum === 0) return t("voting.refuse_to_arbitrate");

    // If still loading dispute data or no data yet, return null to show skeleton
    if (isLoadingDisputeData || !populatedDisputeData) {
      return null;
    }

    // Try to find the answer from the populated dispute data
    const answer = populatedDisputeData?.answers?.find((answer) => BigInt(answer.id) === BigInt(choiceNum));

    if (answer?.title) {
      return answer.title;
    }

    // Fallback to Answer 0xN format if no answer found
    return t("voting.answer_0x", { ruling: choiceNum });
  }, [voteData, populatedDisputeData, isLoadingDisputeData, hiddenVotes, isActiveRound, period, t]);

  return (
    <_Card
      hover
      className={cn(
        "flex flex-col h-auto w-full p-[20px_16px_24px] [border-left:5px_solid_var(--klerosUIComponentsSecondaryPurple)] gap-4 [&:hover]:cursor-auto lg:grid lg:[grid-template-columns:minmax(70px,_0.3fr)_minmax(140px,_1.2fr)_minmax(140px,_1.3fr)_minmax(70px,_0.6fr)_minmax(70px,_0.5fr)_minmax(70px,_0.5fr)_auto] lg:items-center lg:p-[21.5px_28px] lg:gap-[calc(12px_+_(16_-_12)_*_(min(max(100vw,_900px),_1250px)_-_900px)_/_(350))]",
        "not-dark:shadow-[0px_2px_3px_0px_var(--klerosUIComponentsStroke)]"
      )}
    >
      <div className="flex flex-col gap-4 lg:contents">
        <CaseNumber id={caseId} />
        <CourtName name={courtName} courtId={courtId} />
        <Vote choice={voteChoice} />
        <Round number={roundNumber} />
        <CaseStatus period={draw.dispute?.period} ruled={draw.dispute?.ruled} />
        <div className="flex flex-row justify-between items-center gap-4 lg:contents">
          <VoteCount count={voteCount} />
          <StyledArrowLink
            to={`/cases/${caseId?.toString()}/voting`}
            className="text-[14px] [&&_>_svg]:h-[15px] [&&_>_svg]:w-[15px] lg:[justify-self:end]"
          >
            {t("voting.view_vote")} <ArrowIcon />
          </StyledArrowLink>
        </div>
      </div>
    </_Card>
  );
};

export default VoteCard;
