import React, { useMemo, useState } from "react";
import styled from "styled-components";

import { Log, decodeEventLog, parseAbi } from "viem";
import { useAccount, useBalance, usePublicClient } from "wagmi";

import { Button } from "@kleros/ui-components-library";

import DisputeIcon from "svgs/icons/dispute.svg";

import { IDisputeTemplate, useNewDisputeContext } from "context/NewDisputeContext";
import {
  useWriteDisputeResolverCreateDisputeForTemplate,
  useSimulateDisputeResolverCreateDisputeForTemplate,
} from "hooks/contracts/generated";
import { isUndefined } from "utils/index";
import { prepareArbitratorExtradata } from "utils/prepareArbitratorExtradata";
import { wrapWithToast } from "utils/wrapWithToast";

import { EnsureChain } from "components/EnsureChain";
import Popup, { PopupType } from "components/Popup";

import { ErrorButtonMessage } from "components/ErrorButtonMessage";
import ClosedCircleIcon from "components/StyledIcons/ClosedCircleIcon";

const StyledButton = styled(Button)``;

const SubmitDisputeButton: React.FC = () => {
  const publicClient = usePublicClient();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [courtId, setCourtId] = useState("");
  const [disputeId, setDisputeId] = useState<number>();

  const { disputeTemplate, disputeData, resetDisputeData, isSubmittingCase, setIsSubmittingCase } =
    useNewDisputeContext();

  const { address } = useAccount();
  const { data: userBalance, isLoading: isBalanceLoading } = useBalance({ address });

  const insufficientBalance = useMemo(() => {
    const arbitrationCost = disputeData.arbitrationCost ? BigInt(disputeData.arbitrationCost) : BigInt(0);
    return userBalance && userBalance.value < arbitrationCost;
  }, [userBalance, disputeData]);

  // TODO: decide which dispute kit to use
  const { data: submitCaseConfig, error } = useSimulateDisputeResolverCreateDisputeForTemplate({
    query: {
      enabled: !insufficientBalance && isTemplateValid(disputeTemplate),
    },
    args: [
      prepareArbitratorExtradata(disputeData.courtId ?? "1", disputeData.numberOfJurors ?? "", 1),
      JSON.stringify(disputeTemplate),
      "",
      BigInt(disputeTemplate.answers.length),
    ],
    value: BigInt(disputeData.arbitrationCost ?? 0),
  });

  const { writeContractAsync: submitCase } = useWriteDisputeResolverCreateDisputeForTemplate();

  const isButtonDisabled = useMemo(
    () => isSubmittingCase || !isTemplateValid(disputeTemplate) || isBalanceLoading || insufficientBalance,
    [isSubmittingCase, insufficientBalance, isBalanceLoading, disputeTemplate]
  );

  const errorMsg = useMemo(() => {
    if (insufficientBalance) return "Insufficient balance";
    else if (error) {
      return error?.shortMessage ?? error.message;
    }
    return null;
  }, [error, insufficientBalance]);

  return (
    <>
      {" "}
      <EnsureChain>
        <div>
          <StyledButton
            text="Submit the case"
            disabled={isButtonDisabled}
            isLoading={(isSubmittingCase || isBalanceLoading) && !insufficientBalance}
            onClick={() => {
              if (submitCaseConfig) {
                setIsSubmittingCase(true);
                wrapWithToast(async () => await submitCase(submitCaseConfig.request), publicClient)
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
          {errorMsg && (
            <ErrorButtonMessage>
              <ClosedCircleIcon /> {errorMsg}
            </ErrorButtonMessage>
          )}
        </div>
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
    disputeTemplate.question !== "" &&
    disputeTemplate.answers.every((answer) => answer.title !== "" && answer.description !== "");

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
