import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import { IDisputeTemplate, useNewDisputeContext } from "context/NewDisputeContext";
import { wrapWithToast } from "utils/wrapWithToast";
import {
  useDisputeResolverCreateDisputeForTemplate,
  usePrepareDisputeResolverCreateDisputeForTemplate,
} from "hooks/contracts/generated";
import { prepareArbitratorExtradata } from "utils/prepareArbitratorExtradata";
import { usePublicClient } from "wagmi";
import Popup, { PopupType } from "components/Popup";
import DisputeIcon from "assets/svgs/icons/dispute.svg";
import { Log, decodeEventLog, parseAbi } from "viem";
import { EnsureChain } from "components/EnsureChain";
import { isUndefined } from "utils/index";

const StyledButton = styled(Button)``;

const SubmitDisputeButton: React.FC = () => {
  const publicClient = usePublicClient();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [courtId, setCourtId] = useState("");
  const [disputeId, setDisputeId] = useState<number>();

  const { disputeTemplate, disputeData, resetDisputeData, isSubmittingCase, setIsSubmittingCase } =
    useNewDisputeContext();

  const { config: submitCaseConfig } = usePrepareDisputeResolverCreateDisputeForTemplate({
    enabled: isTemplateValid(disputeTemplate),
    args: [
      prepareArbitratorExtradata(disputeData.courtId ?? "1", disputeData.numberOfJurors ?? "", 1), //TODO: decide which dispute kit to use
      JSON.stringify(disputeTemplate),
      "",
      BigInt(disputeTemplate.answers.length),
    ],
    value: BigInt(disputeData.arbitrationCost ?? 0),
  });

  const { writeAsync: submitCase } = useDisputeResolverCreateDisputeForTemplate(submitCaseConfig);

  const isButtonDisabled = useMemo(
    () => isSubmittingCase || !isTemplateValid(disputeTemplate),
    [isSubmittingCase, disputeTemplate]
  );

  return (
    <>
      {" "}
      <EnsureChain>
        <StyledButton
          text="Submit the case"
          disabled={isButtonDisabled}
          isLoading={isSubmittingCase}
          onClick={() => {
            if (submitCase) {
              setIsSubmittingCase(true);
              wrapWithToast(async () => await submitCase().then((response) => response.hash), publicClient)
                .then((res) => {
                  if (res.status && !isUndefined(res.result)) {
                    const id = retrieveDisputeId(res.result.logs[1]);
                    setDisputeId(Number(id));
                    setCourtId(disputeData.courtId ?? "1");
                    setIsPopupOpen(true);
                    resetDisputeData();
                  }
                })
                .finally(() => {
                  setIsSubmittingCase(false);
                });
            }
          }}
        />
      </EnsureChain>
      {isPopupOpen && disputeId && (
        <Popup
          title={`Case #${disputeId} submitted`}
          icon={DisputeIcon}
          popupType={PopupType.DISPUTE_CREATED}
          setIsOpen={setIsPopupOpen}
          disputeId={disputeId}
          courtId={courtId}
        />
      )}
    </>
  );
};

const isTemplateValid = (disputeTemplate: IDisputeTemplate) => {
  const areVotingOptionsFilled =
    disputeTemplate.question !== "" && disputeTemplate.answers.every((answer) => answer.title !== "");

  return (disputeTemplate.title &&
    disputeTemplate.description &&
    disputeTemplate.policyURI &&
    areVotingOptionsFilled) as boolean;
};

const retrieveDisputeId = (eventLog: Log) =>
  decodeEventLog({
    abi: parseAbi(["event DisputeCreation(uint256 indexed, address indexed)"]),
    data: eventLog.data,
    topics: eventLog.topics,
  }).args[0];

export default SubmitDisputeButton;
