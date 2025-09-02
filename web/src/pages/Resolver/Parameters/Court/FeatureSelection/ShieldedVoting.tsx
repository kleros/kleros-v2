import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { Radio } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { DisputeKits } from "src/consts";

import WithHelpTooltip from "components/WithHelpTooltip";

const VotingContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: start;
  border-bottom: 1px solid ${({ theme }) => theme.stroke};
  padding-bottom: 16px;
`;

const VotingHeaderContainer = styled.div`
  width: 100%;
  padding-top: 16px;
`;

const VotingHeader = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const VotingSubTitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryText};
  padding: 0;
  margin: 0;
`;

const StyledRadio = styled(Radio)`
  font-size: 14px;
`;

enum VotingType {
  OneStep = "Shutter",
  TwoStep = "Classic",
}

// Selects one of Classic or Shutter DisputeKit
const ShieldedVoting: React.FC = () => {
  const [votingType, setVotingType] = useState<VotingType>();
  const { disputeData, setDisputeData, disputeKitOptions } = useNewDisputeContext();

  // we try to keep this structure among feature components
  // keep in mind the other options that will need to be disabled if a certain feature is selected
  useEffect(() => {
    // disable TokenGatedShutter if selected, if TokenGated Selected do nothing
    if (votingType === VotingType.TwoStep && disputeData.disputeKitData?.type !== "gated") {
      const disputeKit = disputeKitOptions.find((dk) => dk.text === DisputeKits.Classic);

      setDisputeData({ ...disputeData, disputeKitId: disputeKit?.value });
    }

    if (votingType === VotingType.OneStep) {
      // user has already selected TokenGated, so selecting Shutter here, we need to select TokenGatedShutter
      if (disputeData.disputeKitData?.type === "gated") {
        const disputeKit = disputeKitOptions.find((dk) => dk.text === DisputeKits.GatedShutter);

        // no need to set DisputeKitData, will already be set by JurorEligibility
        setDisputeData({ ...disputeData, disputeKitId: disputeKit?.value });
      } else {
        const disputeKit = disputeKitOptions.find((dk) => dk.text === DisputeKits.Shutter);

        setDisputeData({ ...disputeData, disputeKitId: disputeKit?.value });
      }
    }
  }, [votingType]);

  return (
    <VotingContainer>
      <VotingHeaderContainer>
        <VotingHeader>Shielded Voting</VotingHeader>
        <VotingSubTitle>It hides the jurors&apos; votes until the end of the voting period.</VotingSubTitle>
      </VotingHeaderContainer>
      <WithHelpTooltip tooltipMsg="The jurors’ votes are hidden. Nobody can see them before the voting period completes. (It takes place in one step via Shutter Network) ">
        <StyledRadio
          label="Single-step via Shutter Network"
          name="shieldedVoting"
          small
          onChange={() => setVotingType(VotingType.OneStep)}
          checked={votingType === VotingType.OneStep}
        />
      </WithHelpTooltip>
      <WithHelpTooltip tooltipMsg="The jurors’ votes are hidden. Nobody can see them before the voting period completes. (It takes place in two steps commit-reveal) ">
        <StyledRadio
          label="Two-steps commit-reveal"
          name="shieldedVoting"
          small
          onChange={() => setVotingType(VotingType.TwoStep)}
          checked={votingType === VotingType.TwoStep}
        />
      </WithHelpTooltip>
    </VotingContainer>
  );
};

export default ShieldedVoting;
