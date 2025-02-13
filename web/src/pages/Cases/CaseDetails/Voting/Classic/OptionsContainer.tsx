import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";

import { Button } from "@kleros/ui-components-library";

import { usePopulatedDisputeData } from "hooks/queries/usePopulatedDisputeData";
import { isUndefined } from "utils/index";

import { EnsureChain } from "components/EnsureChain";

import JustificationArea from "./JustificationArea";
import { Answer } from "@kleros/kleros-sdk";

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

  // if RTA not found in dispute.answers, show RTA. shows RTA in case of invalid dispute too
  const showRTA = useMemo(
    () => isUndefined(disputeDetails?.answers.find((answer) => BigInt(answer.id) === BigInt(0))),
    [disputeDetails]
  );

  const onClick = useCallback(
    async (id: bigint) => {
      setIsSending(true);
      setChosenOption(id);
      await handleSelection(id);
      setChosenOption(BigInt(-1));
      setIsSending(false);
    },
    [handleSelection, setChosenOption, setIsSending]
  );

  return id ? (
    <>
      <MainContainer dir="auto">
        <ReactMarkdown>{disputeDetails?.question ?? ""}</ReactMarkdown>
        {!isUndefined(justification) && !isUndefined(setJustification) ? (
          <JustificationArea {...{ justification, setJustification }} />
        ) : null}
        <StyledEnsureChain>
          <OptionsContainer>
            {disputeDetails?.answers?.map((answer: Answer) => {
              return (
                <Button
                  text={answer.title}
                  disabled={isSending}
                  isLoading={chosenOption === BigInt(answer.id)}
                  onClick={() => onClick(BigInt(answer.id))}
                />
              );
            })}
          </OptionsContainer>
        </StyledEnsureChain>
      </MainContainer>
      {showRTA ? (
        <RefuseToArbitrateContainer>
          <EnsureChain>
            <Button
              variant="secondary"
              text="Refuse to Arbitrate"
              disabled={isSending}
              isLoading={chosenOption === BigInt(0)}
              onClick={() => onClick(BigInt(0))}
            />
          </EnsureChain>
        </RefuseToArbitrateContainer>
      ) : null}
    </>
  ) : null;
};

export default Options;
