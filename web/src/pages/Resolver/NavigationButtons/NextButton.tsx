import React from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import { useNewDisputeContext } from "context/NewDisputeContext";

import { DisputeKitDataEncoder } from "src/dispute-kits/prepareArbitratorExtradata";
import { isEmpty } from "src/utils";

interface INextButton {
  nextRoute: string;
}

const NextButton: React.FC<INextButton> = ({ nextRoute }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { disputeData, isPolicyUploading } = useNewDisputeContext();
  const location = useLocation();

  // Check dispute kit data validation status
  const isDisputeDataValid = React.useMemo(() => {
    const kitId = disputeData.disputeKitId;
    if (kitId === undefined) return true;

    // if a dk has encoder, then we need disputeKitData to be defined
    const hasEncoder = DisputeKitDataEncoder[kitId] !== undefined;
    if (!hasEncoder) return true;
    if (!disputeData.disputeKitData) return false;

    return disputeData.disputeKitData.isValid === true;
  }, [disputeData.disputeKitData, disputeData.disputeKitId]);

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
      (!disputeData.courtId || !disputeData.disputeKitId || !isDisputeDataValid)) ||
    (location.pathname.includes("/resolver/jurors") && (!disputeData.arbitrationCost || !disputeData.numberOfJurors)) ||
    (location.pathname.includes("/resolver/voting-options") && !areVotingOptionsFilled) ||
    (location.pathname.includes("/resolver/notable-persons") && !areAliasesValidOrEmpty) ||
    (location.pathname.includes("/resolver/policy") && (isPolicyUploading || !disputeData.policyURI));

  return <Button disabled={isButtonDisabled} onClick={() => navigate(nextRoute)} text={t("buttons.next")} />;
};

export default NextButton;
