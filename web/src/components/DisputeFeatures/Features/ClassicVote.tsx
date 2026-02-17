import React from "react";

import { useTranslation } from "react-i18next";

import { Features } from "consts/disputeFeature";
import { useNewDisputeContext } from "context/NewDisputeContext";

import { useCourtDetails } from "queries/useCourtDetails";

import WithHelpTooltip from "components/WithHelpTooltip";

import { RadioInput, StyledRadio } from ".";

const ClassicVote: React.FC<RadioInput> = (props) => {
  const { t } = useTranslation();
  const { disputeData } = useNewDisputeContext();
  const { data: courtData } = useCourtDetails(disputeData.courtId);
  const isCommitEnabled = Boolean(courtData?.court?.hiddenVotes);
  return (
    <WithHelpTooltip
      tooltipMsg={isCommitEnabled ? t("features.hidden_votes_tooltip") : t("features.non_hidden_votes_tooltip")}
      key={Features.ClassicVote}
    >
      <StyledRadio label={isCommitEnabled ? t("features.two_step_commit") : t("features.disabled")} small {...props} />
    </WithHelpTooltip>
  );
};

export default ClassicVote;
