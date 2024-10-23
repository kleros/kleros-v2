import React from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";
import { isEmpty } from "src/utils";

interface INextButton {
  nextRoute: string;
}

const NextButton: React.FC<INextButton> = ({ nextRoute }) => {
  const navigate = useNavigate();
  const { disputeData, isPolicyUploading } = useNewDisputeContext();
  const location = useLocation();

  //checks if each answer is filled in
  const areVotingOptionsFilled =
    disputeData.question !== "" &&
    disputeData.answers.every((answer) => answer.title !== "" && answer.description !== "");

  //check if any filled address or ens is invalid
  const areFilledAddressesValid = disputeData?.aliasesArray?.every((alias) =>
    isEmpty(alias.address) && isEmpty(alias.name) ? true : alias.isValid
  );

  const isButtonDisabled =
    (location.pathname.includes("/resolver/title") && !disputeData.title) ||
    (location.pathname.includes("/resolver/description") && !disputeData.description) ||
    (location.pathname.includes("/resolver/court") && !disputeData.courtId) ||
    (location.pathname.includes("/resolver/jurors") && !disputeData.arbitrationCost) ||
    (location.pathname.includes("/resolver/voting-options") && !areVotingOptionsFilled) ||
    (location.pathname.includes("/resolver/notable-persons") && !areFilledAddressesValid) ||
    (location.pathname.includes("/resolver/policy") && (isPolicyUploading || !disputeData.policyURI));

  return <Button disabled={isButtonDisabled} onClick={() => navigate(nextRoute)} text="Next" />;
};

export default NextButton;
