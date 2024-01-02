import React from "react";
import { Button } from "@kleros/ui-components-library";
import { useLocation, useNavigate } from "react-router-dom";
import { useNewDisputeContext } from "context/NewDisputeContext";

interface INextButton {
  nextRoute: string;
}

const NextButton: React.FC<INextButton> = ({ nextRoute }) => {
  const navigate = useNavigate();
  const { disputeData } = useNewDisputeContext();
  const location = useLocation();

  //checks if each answer is filled in
  const areVotingOptionsFilled =
    disputeData.question !== "" &&
    disputeData.answers.every((answer) => answer.title !== "") &&
    disputeData.answers.length === disputeData.numberOfRulingOptions;

  const isButtonDisabled =
    (location.pathname.includes("/resolver/title") && !disputeData.title) ||
    (location.pathname.includes("/resolver/description") && !disputeData.description) ||
    (location.pathname.includes("/resolver/court") && !disputeData.courtId) ||
    (location.pathname.includes("/resolver/jurors") && !disputeData.numberOfJurors) ||
    (location.pathname.includes("/resolver/votingoptions") && !areVotingOptionsFilled) ||
    (location.pathname.includes("/resolver/counterparties") && !disputeData.aliases) ||
    (location.pathname.includes("/resolver/policy") && !disputeData.policyFile);

  return <Button disabled={isButtonDisabled} onClick={() => navigate(nextRoute)} text="Next" />;
};

export default NextButton;
