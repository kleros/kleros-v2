import React from "react";
import ReactMarkdown from "components/ReactMarkdown";
import styled from "styled-components";
import { StyledSkeleton } from "components/StyledSkeleton";
import { isUndefined } from "utils/index";

const StyledH1 = styled.h1`
  margin: 0;
`;

const QuestionAndDescription = styled.div`
  display: flex;
  flex-direction: column;
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
  gap: 8px;
`;

interface IAnswer {
  id?: string;
  title: string;
  description?: string;
  reserved?: boolean;
}

interface IDisputeTemplate {
  answers: IAnswer[];
  arbitrableAddress: string;
  arbitrableChainID: string;
  arbitratorAddress: string;
  arbitratorChainID: string;
  category?: string;
  description: string;
  frontendUrl?: string;
  lang?: string;
  policyURI?: string;
  question: string;
  specification?: string;
  title: string;
}

interface IDisputeContext {
  disputeTemplate: IDisputeTemplate;
}

export const DisputeContext: React.FC<IDisputeContext> = ({ disputeTemplate }) => {
  return (
    <>
      <StyledH1>
        {isUndefined(disputeTemplate) ? (
          <StyledSkeleton />
        ) : (
          disputeTemplate?.title ?? "The dispute's template is not correct please vote refuse to arbitrate"
        )}
      </StyledH1>

      <QuestionAndDescription>
        <StyledReactMarkDown>{disputeTemplate?.question}</StyledReactMarkDown>
        <StyledReactMarkDown>{disputeTemplate?.description}</StyledReactMarkDown>
      </QuestionAndDescription>

      {isUndefined(disputeTemplate?.frontendUrl) ? null : (
        <a href={disputeTemplate?.frontendUrl} target="_blank" rel="noreferrer">
          Go to arbitrable
        </a>
      )}
      <VotingOptions>
        {isUndefined(disputeTemplate) ? null : <h3>Voting Options</h3>}
        <AnswersContainer>
          {disputeTemplate?.answers?.map((answer: IAnswer, i: number) => (
            <Answer key={i}>
              <small>Option {i + 1}:</small>
              <label>{answer.title}</label>
            </Answer>
          ))}
        </AnswersContainer>
      </VotingOptions>
    </>
  );
};
