import React from "react";
import { Button } from "@kleros/ui-components-library";
import { useLocation, useNavigate } from "react-router-dom";
import { useNewDisputeContext } from "context/NewDisputeContext";

interface INextButton {
  nextRoute: string;
}

const NextButton: React.FC<INextButton> = ({ nextRoute }) => {
  const navigate = useNavigate();
  const { disputeData, isPolicyUploading } = useNewDisputeContext();
  const location = useLocation();

  //checks if each answer is filled in
  const areVotingOptionsFilled =
    disputeData.question !== "" && disputeData.answers.every((answer) => answer.title !== "");

  //check if any filled address or ens is invalid
  const areFilledAddressesValid = disputeData?.aliases?.every((alias) => alias.address === "" || alias.isValid);

  const isButtonDisabled =
    (location.pathname.includes("/resolver/title") && !disputeData.title) ||
    (location.pathname.includes("/resolver/description") && !disputeData.description) ||
    (location.pathname.includes("/resolver/court") && !disputeData.courtId) ||
    (location.pathname.includes("/resolver/jurors") && !disputeData.arbitrationCost) ||
    (location.pathname.includes("/resolver/votingoptions") && !areVotingOptionsFilled) ||
    (location.pathname.includes("/resolver/notablepersons") && !areFilledAddressesValid) ||
    (location.pathname.includes("/resolver/policy") && (isPolicyUploading || !disputeData.policyURI));

  return <Button disabled={isButtonDisabled} onClick={() => navigate(nextRoute)} text="Next" />;
};

export default NextButton;
