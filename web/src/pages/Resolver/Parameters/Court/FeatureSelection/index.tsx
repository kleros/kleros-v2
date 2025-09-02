import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { Card } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { DisputeKits } from "src/consts";

import JurorEligibility from "./JurorEligibility";
import ShieldedVoting from "./ShieldedVoting";

const Container = styled(Card)`
  width: 100%;
  height: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.secondaryBlue};
  padding: 0;
  margin: 0;
`;

const FeatureSelection: React.FC = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  const { disputeKitOptions, disputeData, setDisputeData } = useNewDisputeContext();

  // if supported dispute kits have Classic and Shutter
  const showVotingFeatures = useMemo(() => {
    return (
      disputeKitOptions.some((dk) => dk.text === DisputeKits.Classic) &&
      disputeKitOptions.some((dk) => dk.text === DisputeKits.Shutter)
    );
  }, [disputeKitOptions]);

  // if supported dispute kits have Classic, TokenGated, TokenGatedShutter
  const showEligibilityFeatures = useMemo(() => {
    return (
      disputeKitOptions.some((dk) => dk.text === DisputeKits.Classic) &&
      disputeKitOptions.some((dk) => dk.text === DisputeKits.GatedShutter) &&
      disputeKitOptions.some((dk) => dk.text === DisputeKits.Gated)
    );
  }, [disputeKitOptions]);

  useEffect(() => {
    // there's only one, NOTE: what happens when here only TokenGated is support? we need the value
    if (disputeKitOptions.length === 1) {
      const disputeKit = disputeKitOptions[0];
      setDisputeData({ ...disputeData, disputeKitId: disputeKit.value });
      setShowFeatures(false);
    } else {
      setShowFeatures(true);
    }
  }, [disputeKitOptions]);

  if (!showFeatures) return null;
  return (
    <Container>
      <SubTitle>Additional features available in this court:</SubTitle>
      {showVotingFeatures ? <ShieldedVoting /> : null}
      {showEligibilityFeatures ? <JurorEligibility /> : null}
    </Container>
  );
};

export default FeatureSelection;
