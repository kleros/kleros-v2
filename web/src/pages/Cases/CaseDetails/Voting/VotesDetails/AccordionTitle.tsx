import React from "react";

import { useTranslation } from "react-i18next";

import { Answer } from "context/NewDisputeContext";
import { getVoteChoice } from "utils/getVoteChoice";
import { isUndefined } from "utils/index";

import { InternalLink } from "components/InternalLink";
import JurorLink from "components/JurorLink";

const VoteStatus: React.FC<{
  choice?: string;
  period: string;
  answers: Answer[];
  commited: boolean;
  isActiveRound: boolean;
  hiddenVotes: boolean;
}> = ({ choice, period, answers, isActiveRound, commited, hiddenVotes }) => {
  const { t } = useTranslation();

  if (hiddenVotes) {
    if (!commited && (isActiveRound ? ["vote", "appeal", "execution"].includes(period) : true))
      return (
        <label className="text-[16px] text-klerosUIComponentsPrimaryText">{t("voting.did_not_commit_vote")}</label>
      );

    if (["evidence", "commit"].includes(period))
      return (
        <label className="text-[16px] text-klerosUIComponentsPrimaryText">
          {commited ? t("voting.vote_committed") : t("voting.pending_vote_commitment")}
        </label>
      );
  }

  // not voted
  if (isUndefined(choice) && (isActiveRound ? ["appeal", "execution"].includes(period) : true))
    return <label className="text-[16px] text-klerosUIComponentsPrimaryText">{t("voting.did_not_vote")}</label>;

  return (
    <label className="text-[16px] text-klerosUIComponentsPrimaryText">
      {isUndefined(choice) ? (
        t("voting.pending_vote")
      ) : (
        <small className="text-[16px]">{getVoteChoice(choice, answers)}</small>
      )}
    </label>
  );
};

const AccordionTitle: React.FC<{
  juror: string;
  choice?: string;
  voteCount: number;
  period: string;
  answers: Answer[];
  isActiveRound: boolean;
  commited: boolean;
  hiddenVotes: boolean;
}> = ({ juror, choice, voteCount, period, answers, isActiveRound, commited, hiddenVotes }) => {
  const { t } = useTranslation();
  const profileLink = `/profile/stakes/1?address=${juror}`;

  return (
    <div className="flex flex-col [align-items:start] gap-2.75 flex-wrap lg:flex-row lg:items-center lg:gap-3">
      <div className="flex gap-2 items-center">
        <InternalLink
          to={profileLink}
          className="flex [&:hover_label]:cursor-pointer [&:hover_label]:text-klerosUIComponentsSecondaryBlue"
        >
          <JurorLink address={juror} />
        </InternalLink>
      </div>
      <VoteStatus {...{ choice, period, answers, isActiveRound, commited, hiddenVotes }} />
      <label className="text-[16px] text-klerosUIComponentsSecondaryPurple">
        {t("voting.vote", { count: voteCount })}
      </label>
    </div>
  );
};

export default AccordionTitle;
