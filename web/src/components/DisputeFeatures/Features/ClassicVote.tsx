import React from "react";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { useCourtDetails } from "queries/useCourtDetails";

import WithHelpTooltip from "components/WithHelpTooltip";

import { RadioInput, StyledRadio } from ".";

const ClassicVote: React.FC<RadioInput> = (props) => {
  const { disputeData } = useNewDisputeContext();
  const { data: courtData } = useCourtDetails(disputeData.courtId);
  const isCommitEnabled = Boolean(courtData?.court?.hiddenVotes);
  return (
    <WithHelpTooltip
      tooltipMsg={
        isCommitEnabled
          ? `The jurors' votes are hidden. 
        Nobody can see them before the voting period completes. 
        (It takes place in two steps commit-reveal)`
          : `The jurors' votes are not hidden. 
        Everybody can see the justification and voted choice before the voting period completes.`
      }
    >
      <StyledRadio label={isCommitEnabled ? "Two-steps commit-reveal" : "Classic one step voting"} small {...props} />
    </WithHelpTooltip>
  );
};

export default ClassicVote;
