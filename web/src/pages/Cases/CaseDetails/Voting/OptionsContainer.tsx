import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";

import { Answer } from "@kleros/kleros-sdk";
import { RefuseToArbitrateAnswer } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsSchema";
import { Button, Tooltip } from "@kleros/ui-components-library";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { isUndefined } from "utils/index";

import { EnsureChain } from "components/EnsureChain";
import MarkdownEditor from "components/MarkdownEditor";

const MainContainer = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
`;

const OptionsContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
`;

const RefuseToArbitrateContainer = styled.div`
  position: relative;
  left: 0;
  right: 0;
  width: auto;
  margin: calc(-1 * (16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875));
  margin-top: 32px;
  background-color: ${({ theme }) => theme.lightBlue};
  padding: 32px;
  display: flex;
  justify-content: center;
`;

const StyledEnsureChain = styled(EnsureChain)`
  align-self: center;
`;

interface IOptions {
  arbitrable: `0x${string}`;
  handleSelection: (arg0: bigint) => Promise<void>;
  justification?: string;
  setJustification?: (arg0: string) => void;
}

const Options: React.FC<IOptions> = ({ arbitrable, handleSelection, justification, setJustification }) => {
  const { id } = useParams();
  const { data: disputeDetails } = usePopulatedDisputeData(id, arbitrable);
  const [chosenOption, setChosenOption] = useState(BigInt(-1));
  const [isSending, setIsSending] = useState(false);

  const updatedRTA = useMemo(() => {
    const RTAFromTemplate = disputeDetails?.answers?.find((answer) => BigInt(answer.id) === BigInt(0));
    if (!RTAFromTemplate) return RefuseToArbitrateAnswer;
    return RTAFromTemplate;
  }, [disputeDetails]);

  const onClick = useCallback(
    async (id: bigint) => {
      setIsSending(true);
      setChosenOption(id);
      try {
        await handleSelection(id);
      } catch (error) {
        console.error(error);
      } finally {
        setChosenOption(BigInt(-1));
        setIsSending(false);
      }
    },
    [handleSelection]
  );

  return id ? (
    <>
      <MainContainer dir="auto">
        <ReactMarkdown>{disputeDetails?.question ?? ""}</ReactMarkdown>
        {!isUndefined(justification) && !isUndefined(setJustification) ? (
          <MarkdownEditor value={justification} onChange={setJustification} />
        ) : null}
        {isUndefined(disputeDetails?.answers) ? null : (
          <StyledEnsureChain>
            <OptionsContainer>
              {disputeDetails?.answers?.map((answer: Answer) => {
                return BigInt(answer.id) !== BigInt(0) ? (
                  <Tooltip text={answer.description} key={answer.title}>
                    <Button
                      text={answer.title}
                      disabled={isSending}
                      isLoading={chosenOption === BigInt(answer.id)}
                      onClick={() => onClick(BigInt(answer.id))}
                    />
                  </Tooltip>
                ) : null;
              })}
            </OptionsContainer>
          </StyledEnsureChain>
        )}
      </MainContainer>
      <RefuseToArbitrateContainer>
        <EnsureChain>
          <Tooltip text={updatedRTA.description}>
            <Button
              variant="secondary"
              text={updatedRTA.title}
              disabled={isSending}
              isLoading={chosenOption === BigInt(0)}
              onClick={() => onClick(BigInt(0))}
            />
          </Tooltip>
        </EnsureChain>
      </RefuseToArbitrateContainer>
    </>
  ) : null;
};

export default Options;
