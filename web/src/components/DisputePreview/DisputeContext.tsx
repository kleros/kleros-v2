import React from "react";
import styled from "styled-components";

import { DisputeDetails } from "@kleros/kleros-sdk/src/dataMappings/utils/disputeDetailsTypes";

import { INVALID_DISPUTE_DATA_ERROR, RPC_ERROR } from "consts/index";
import { Answer as IAnswer } from "context/NewDisputeContext";
import { isUndefined } from "utils/index";

import { responsiveSize } from "styles/responsiveSize";

import ReactMarkdown from "components/ReactMarkdown";
import { StyledSkeleton } from "components/StyledSkeleton";

import AliasDisplay from "./Alias";

const StyledH1 = styled.h1`
  margin: 0;
  word-wrap: break-word;
`;

const QuestionAndDescription = styled.div`
  display: flex;
  flex-direction: column;
  word-wrap: break-word;
  div:first-child p:first-of-type {
    font-size: 16px;
    font-weight: 600;
  }
`;

const StyledReactMarkDown = styled(ReactMarkdown)`
  margin: 0px;
`;

const VotingOptions = styled(QuestionAndDescription)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnswersContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Answer = styled.div`
  margin: 0px;
  display: flex;
  flex-wrap: wrap;
  gap: ${responsiveSize(2, 8)};
  > label {
    max-width: 100%;
  }
`;

const AliasesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${responsiveSize(8, 20)};
`;

const Divider = styled.hr`
  width: 100%;
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
`;
interface IDisputeContext {
  disputeDetails?: DisputeDetails;
  isRpcError?: boolean;
}

export const DisputeContext: React.FC<IDisputeContext> = ({ disputeDetails, isRpcError = false }) => {
  const errMsg = isRpcError ? RPC_ERROR : INVALID_DISPUTE_DATA_ERROR;
  return (
    <>
      <StyledH1>{isUndefined(disputeDetails) ? <StyledSkeleton /> : disputeDetails?.title ?? errMsg}</StyledH1>
      {!isUndefined(disputeDetails) && (
        <QuestionAndDescription>
          <StyledReactMarkDown>{disputeDetails?.question}</StyledReactMarkDown>
          <StyledReactMarkDown>{disputeDetails?.description}</StyledReactMarkDown>
        </QuestionAndDescription>
      )}
      {isUndefined(disputeDetails?.frontendUrl) ? null : (
        <a href={disputeDetails?.frontendUrl} target="_blank" rel="noreferrer">
          Go to arbitrable
        </a>
      )}
      <VotingOptions>
        {isUndefined(disputeDetails) ? null : <h3>Voting Options</h3>}
        <AnswersContainer>
          {disputeDetails?.answers?.map((answer: IAnswer, i: number) => (
            <Answer key={answer.title}>
              <small>Option {i + 1}:</small>
              <label>
                {answer.title}
                {answer.description ? ` - ${answer.description}` : null}
              </label>
            </Answer>
          ))}
        </AnswersContainer>
      </VotingOptions>

      {isUndefined(disputeDetails?.aliases) ? null : (
        <>
          <Divider />
          <AliasesContainer>
            {Object.keys(disputeDetails.aliases).map((key) => (
              <AliasDisplay name={key} key={key} address={disputeDetails.aliases[key]} />
            ))}
          </AliasesContainer>
        </>
      )}
    </>
  );
};
