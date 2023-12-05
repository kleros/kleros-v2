import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@kleros/ui-components-library";
import { isUndefined } from "utils/index";
import { useDisputeTemplate } from "queries/useDisputeTemplate";
import { EnsureChain } from "components/EnsureChain";
import JustificationArea from "./JustificationArea";

const MainContainer = styled.div`
  width: 100%;
  height: auto;
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

interface IOptions {
  arbitrable: `0x${string}`;
  handleSelection: (arg0: number) => Promise<void>;
  justification?: string;
  setJustification?: (arg0: string) => void;
}

const Options: React.FC<IOptions> = ({ arbitrable, handleSelection, justification, setJustification }) => {
  const { id } = useParams();
  const { data: disputeTemplate } = useDisputeTemplate(id, arbitrable);
  const [chosenOption, setChosenOption] = useState(-1);
  const [isSending, setIsSending] = useState(false);

  const onClick = useCallback(
    async (id: number) => {
      setIsSending(true);
      setChosenOption(id);
      await handleSelection(id);
      setChosenOption(-1);
      setIsSending(false);
    },
    [handleSelection, setChosenOption, setIsSending]
  );

  return id ? (
    <>
      <MainContainer>
        <ReactMarkdown>{disputeTemplate?.question}</ReactMarkdown>
        {!isUndefined(justification) && !isUndefined(setJustification) ? (
          <JustificationArea {...{ justification, setJustification }} />
        ) : null}
        <OptionsContainer>
          {disputeTemplate?.answers?.map((answer: { title: string; description: string }, i: number) => {
            return (
              <EnsureChain key={answer.title}>
                <Button
                  text={answer.title}
                  disabled={isSending}
                  isLoading={chosenOption === i + 1}
                  onClick={() => onClick(i + 1)}
                />
              </EnsureChain>
            );
          })}
        </OptionsContainer>
      </MainContainer>
      <RefuseToArbitrateContainer>
        <EnsureChain>
          <Button
            variant="secondary"
            text="Refuse to Arbitrate"
            disabled={isSending}
            isLoading={chosenOption === 0}
            onClick={() => onClick(0)}
          />
        </EnsureChain>
      </RefuseToArbitrateContainer>
    </>
  ) : null;
};

export default Options;
