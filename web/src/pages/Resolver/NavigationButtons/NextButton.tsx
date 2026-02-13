import React from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import { IGatedDisputeData, useNewDisputeContext } from "context/NewDisputeContext";

import { isEmpty } from "src/utils";

interface INextButton {
  nextRoute: string;
}

const NextButton: React.FC<INextButton> = ({ nextRoute }) => {
  const navigate = useNavigate();
  const { disputeData, isPolicyUploading } = useNewDisputeContext();
  const location = useLocation();

  // Check gated dispute kit validation status
  const isGatedTokenValid = React.useMemo(() => {
    if (!disputeData.disputeKitData || disputeData.disputeKitData.type !== "gated") return true;

    const gatedData = disputeData.disputeKitData as IGatedDisputeData;
    if (!gatedData?.tokenGate?.trim()) return false; // No token address provided, so invalid

    // If token address is provided, it must be validated as valid ERC20
    return gatedData.isTokenGateValid === true;
  }, [disputeData.disputeKitData]);

  //checks if each answer is filled in
  const areVotingOptionsFilled =
    disputeData.question !== "" &&
    disputeData.answers.every((answer) => answer.title !== "" && answer.description !== "");

  //check if any filled address or ens is invalid
  const areAliasesValidOrEmpty = disputeData?.aliasesArray?.every((alias) => {
    const isAliasEmpty = isEmpty(alias.address) && isEmpty(alias.name);
    return isAliasEmpty || alias.isValid;
  });
  const isButtonDisabled =
    (location.pathname.includes("/resolver/title") && !disputeData.title) ||
    (location.pathname.includes("/resolver/description") && !disputeData.description) ||
    (location.pathname.includes("/resolver/court") &&
      (!disputeData.courtId || !isGatedTokenValid || !disputeData.disputeKitId)) ||
    (location.pathname.includes("/resolver/jurors") && !disputeData.arbitrationCost) ||
    (location.pathname.includes("/resolver/voting-options") && !areVotingOptionsFilled) ||
    (location.pathname.includes("/resolver/notable-persons") && !areAliasesValidOrEmpty) ||
    (location.pathname.includes("/resolver/policy") && (isPolicyUploading || !disputeData.policyURI));

  return <Button disabled={isButtonDisabled} onClick={() => navigate(nextRoute)} text="Next" />;
};

export default NextButton;
