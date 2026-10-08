import React, { useCallback, useMemo, useState } from "react";

import { useParams } from "react-router-dom";
import type { Address } from "viem";

import { Answer } from "@kleros/kleros-sdk";
import { RefuseToArbitrateAnswer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsSchema";
import { Button, Tooltip } from "@kleros/ui-components-library";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { isUndefined } from "utils/index";

import { EnsureChain } from "components/EnsureChain";
import MarkdownEditor from "components/MarkdownEditor";
import MarkdownRenderer from "components/MarkdownRenderer";

import ConfirmVoteModal from "./ConfirmVoteModal";

interface IOptions {
  arbitrable: Address;
  handleSelection: (arg0: bigint) => Promise<void>;
  justification?: string;
  setJustification?: (arg0: string) => void;
  /** Note shown in the confirmation modal when this step does not collect a justification. */
  confirmHint?: React.ReactNode;
}

const Options: React.FC<IOptions> = ({ arbitrable, handleSelection, justification, setJustification, confirmHint }) => {
  const { id } = useParams();
  const { data: disputeDetails } = usePopulatedDisputeData(id, arbitrable);
  const [chosenOption, setChosenOption] = useState(BigInt(-1));
  const [isSending, setIsSending] = useState(false);
  const [pendingOption, setPendingOption] = useState<bigint | undefined>(undefined);

  const updatedRTA = useMemo(() => {
    const RTAFromTemplate = disputeDetails?.answers?.find((answer) => BigInt(answer.id) === BigInt(0));
    if (!RTAFromTemplate) return RefuseToArbitrateAnswer;
    return RTAFromTemplate;
  }, [disputeDetails]);

  const pendingChoice = useMemo(() => {
    if (isUndefined(pendingOption)) return "";
    if (pendingOption === BigInt(0)) return updatedRTA.title;
    return disputeDetails?.answers?.find((answer) => BigInt(answer.id) === pendingOption)?.title ?? "";
  }, [pendingOption, disputeDetails, updatedRTA]);

  const onClick = useCallback((id: bigint) => setPendingOption(id), []);

  const onCancel = useCallback(() => setPendingOption(undefined), []);

  const onConfirm = useCallback(async () => {
    if (isUndefined(pendingOption)) return;

    setPendingOption(undefined);
    setIsSending(true);
    setChosenOption(pendingOption);
    try {
      await handleSelection(pendingOption);
    } catch (error) {
      console.error(error);
    } finally {
      setChosenOption(BigInt(-1));
      setIsSending(false);
    }
  }, [handleSelection, pendingOption]);

  return id ? (
    <>
      <div dir="auto" className="w-full h-auto flex flex-col">
        <MarkdownRenderer content={disputeDetails?.question ?? ""} />
        {!isUndefined(justification) && !isUndefined(setJustification) ? (
          <MarkdownEditor value={justification} onChange={setJustification} />
        ) : null}
        {isUndefined(disputeDetails?.answers) ? null : (
          <EnsureChain className="self-center">
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {disputeDetails?.answers?.map((answer: Answer) => {
                return BigInt(answer.id) !== BigInt(0) ? (
                  <Tooltip text={answer.description} key={answer.title}>
                    <Button
                      text={answer.title}
                      isDisabled={isSending}
                      isLoading={chosenOption === BigInt(answer.id)}
                      onPress={() => onClick(BigInt(answer.id))}
                    />
                  </Tooltip>
                ) : null;
              })}
            </div>
          </EnsureChain>
        )}
      </div>
      <div className="relative left-0 right-0 w-auto m-[calc(-1_*_(16px_+_(32_-_16)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_875))] mt-8 bg-klerosUIComponentsLightBlue p-8 flex justify-center">
        <EnsureChain>
          <Tooltip text={updatedRTA.description}>
            <Button
              variant="secondary"
              text={updatedRTA.title}
              isDisabled={isSending}
              isLoading={chosenOption === BigInt(0)}
              onPress={() => onClick(BigInt(0))}
            />
          </Tooltip>
        </EnsureChain>
      </div>
      <ConfirmVoteModal
        isOpen={!isUndefined(pendingOption)}
        choice={pendingChoice}
        hint={confirmHint}
        {...{ justification, onConfirm, onCancel }}
      />
    </>
  ) : null;
};

export default Options;
